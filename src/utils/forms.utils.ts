// oxlint-disable no-accumulating-spread
import { objectEqual, objectSum } from 'shuutils'

type FormFieldType = 'checkbox' | 'select' | 'text'
type FormFieldOptions = { label: string; value: string }[]
type FormFieldBase = {
  columns: number
  isRequired: boolean
  isValid: boolean
  isVisible: boolean
  label: string
  link: string
  /** a short help added to the error message when the regex fails, like "use whole euros" */
  hint?: string
  /** only set on fields using the default characters, fields with their own regex keep the length rule in it */
  maxLength?: number
  minLength?: number
  options?: FormFieldOptions
  regex: RegExp
  unit: string
}
type FormFieldText = FormFieldBase & { type: 'text'; value: string }
type FormFieldSelect = FormFieldBase & { options: FormFieldOptions; type: 'select'; value: string }
type FormFieldCheckbox = FormFieldBase & { type: 'checkbox'; value: boolean }
type FormField<Type extends FormFieldType> = Type extends 'text' ? FormFieldText : Type extends 'select' ? FormFieldSelect : FormFieldCheckbox

const forbiddenCharacters = /[^\p{L}\p{N}\p{P}\p{S} ]/gu

/**
 * The default rule : letters, numbers, punctuation, symbols and plain spaces, starting and ending with something visible
 * The length is not part of it, see minLength and maxLength on the field
 */
const defaultRegex = /^(?=\S)[\p{L}\p{N}\p{P}\p{S} ]+(?<=\S)$/u

function fieldRegex(regex?: RegExp) {
  return regex ?? defaultRegex
}

/**
 * Explain why a field value is not valid, in a human friendly way
 * @param field the field to check
 * @returns the error message, or undefined when the value is valid
 */
export function getFieldError(field: Pick<FormFieldBase, 'hint' | 'label' | 'maxLength' | 'minLength' | 'regex'> & { value: boolean | string | undefined }) {
  const { hint, label, maxLength, minLength, regex, value } = field
  if (typeof value !== 'string' || value === '') return `${label} is required`
  if (maxLength !== undefined && value.length > maxLength) return `${label} is too long (${value.length} characters, ${maxLength} max)`
  if (minLength !== undefined && value.length < minLength) return `${label} is too short (${value.length} character${value.length > 1 ? 's' : ''}, ${minLength} min)`
  if (String(regex) === String(defaultRegex)) {
    // compared by text because a structured clone of the form creates new RegExp objects
    if (value !== value.trim()) return `${label} should not start or end with a space`
    const forbidden = [...new Set(value.match(forbiddenCharacters))]
    if (forbidden.length > 0) return `${label} contains characters that are not allowed : ${forbidden.map(character => JSON.stringify(character)).join(' ')}`
  }
  if (regex.test(value)) return undefined
  return `${label} is invalid, "${value}"${hint === undefined ? '' : `, ${hint}`}`
}

export type Form = {
  columns?: number
  errorMessage: string
  fields: Record<string, FormField<FormFieldType>>
  isTouched: boolean
  isValid: boolean
}

/**
 * Updates the form with the given fields and values
 * @param form the form to update
 * @param updatedFields the fields to update with their new values
 * @returns the updated form state
 */
export function updateForm<FormType extends Form>(form: FormType, updatedFields: Partial<Record<string, string>>) {
  const updatedForm = structuredClone(form)
  updatedForm.isTouched = true
  const entries = Object.entries(updatedFields)
  for (const [key, value] of entries) {
    if (typeof key !== 'string' || typeof value !== 'string' || key === '' || value === '') continue
    const actualField = updatedForm.fields[key]
    if (actualField === undefined) continue
    if (actualField.type === 'checkbox') updatedForm.fields[key] = { ...actualField, value: value === 'true' }
    else updatedForm.fields[key] = { ...actualField, value }
  }
  const hasChanged = objectSum(updatedForm) !== objectSum(form)
  return { hasChanged, updatedForm }
}

/**
 * Validates the form fields and returns the updated form state
 * @param form the form to validate
 * @returns the updated form state
 */
export function validateForm<FormType extends Form>(form: FormType) {
  let errorMessage = ''
  // oxlint-disable-next-line no-array-reduce
  const updatedFields = Object.entries(form.fields).reduce((accumulator, [field, { hint, isRequired, label, maxLength, minLength, regex, value }]) => {
    const isBoolean = typeof value === 'boolean'
    const isEmptyButNotRequired = !isRequired && typeof value === 'string' && value === ''
    const isUndefinedButNotRequired = !isRequired && value === undefined
    const error = isBoolean || isEmptyButNotRequired || isUndefinedButNotRequired ? undefined : getFieldError({ hint, label, maxLength, minLength, regex, value })
    const isValid = error === undefined
    if (!isValid) errorMessage = error
    return { ...accumulator, [field]: { ...form.fields[field], isValid } }
  }, {})
  const isFormValid = errorMessage === ''
  const updatedForm: FormType = {
    ...form,
    errorMessage,
    fields: updatedFields,
    isTouched: form.isTouched,
    isValid: isFormValid,
  } satisfies FormType
  const hasChanged = !objectEqual(form, updatedForm, { sortKeys: true })
  return { hasChanged, updatedForm }
}

export function createTextField(
  parameters: Partial<Pick<FormFieldText, 'columns' | 'hint' | 'isRequired' | 'isValid' | 'isVisible' | 'link' | 'regex' | 'unit' | 'value'>> & Pick<FormFieldText, 'label'> & { maxLength?: number; minLength?: number },
) {
  const { columns = 1, hint, isRequired = false, isValid = false, isVisible = true, label, link = '', maxLength = 100, minLength = 1, regex, unit = '', value = '' } = parameters
  return {
    columns,
    ...(hint === undefined ? {} : { hint }),
    isRequired,
    isValid,
    isVisible,
    label,
    link,
    // a field with its own regex keeps its length rule inside it, the length given here is for the default regex only
    ...(regex === undefined ? { maxLength, minLength } : {}),
    regex: fieldRegex(regex),
    type: 'text',
    unit,
    value,
  } satisfies FormFieldText
}

export function createCheckboxField(parameters: Partial<Pick<FormFieldCheckbox, 'columns' | 'isRequired' | 'isValid' | 'isVisible' | 'link' | 'value'>> & Pick<FormFieldCheckbox, 'label'>) {
  const { columns = 1, isRequired = false, isValid = false, isVisible = true, label, link = '', value = false } = parameters
  return {
    columns,
    isRequired,
    isValid,
    isVisible,
    label,
    link,
    regex: fieldRegex(),
    type: 'checkbox',
    unit: '',
    value,
  } satisfies FormFieldCheckbox
}

export function createSelectField(parameters: Partial<Pick<FormFieldSelect, 'columns' | 'isRequired' | 'isValid' | 'isVisible' | 'link' | 'regex' | 'value'>> & Pick<FormFieldSelect, 'label' | 'options'>) {
  const { columns = 1, isRequired = false, isValid = false, isVisible = true, label, link = '', options, regex, value = '' } = parameters
  return {
    columns,
    isRequired,
    isValid,
    isVisible,
    label,
    link,
    options,
    regex: fieldRegex(regex),
    type: 'select',
    unit: '',
    value,
  } satisfies FormFieldSelect
}

export function optionsToLabels(values?: FormFieldOptions) {
  return values?.map(({ label }) => label) ?? []
}

export type { FormFieldCheckbox, FormFieldSelect, FormFieldText }

export function alignClipboard(text: string) {
  return text
    .replaceAll(/: ?""(?<thing>[,\n])/gu, ': "__EMPTY__"$<thing>')
    .replaceAll('""', '"')
    .replaceAll('"__EMPTY__"', '""')
    .replace('"{', '{')
    .replace('}"', '}') // need to replace double double quotes with single double quotes (Google Sheet issue -.-'''''')
}
