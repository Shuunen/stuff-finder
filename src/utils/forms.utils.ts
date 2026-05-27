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
  options?: FormFieldOptions
  regex: RegExp
  unit: string
}
type FormFieldText = FormFieldBase & { type: 'text'; value: string }
type FormFieldSelect = FormFieldBase & { options: FormFieldOptions; type: 'select'; value: string }
type FormFieldCheckbox = FormFieldBase & { type: 'checkbox'; value: boolean }
type FormField<Type extends FormFieldType> = Type extends 'text' ? FormFieldText : Type extends 'select' ? FormFieldSelect : FormFieldCheckbox

function fieldRegex(regex?: RegExp, minLength = 3, maxLength = 100) {
  return regex ?? new RegExp(`^[-',.\\d\\p{L}\\s/&]{${minLength},${maxLength}}$`, 'u')
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
  const updatedFields = Object.entries(form.fields).reduce((accumulator, [field, { isRequired, label, regex, value }]) => {
    const isBoolean = typeof value === 'boolean'
    const isEmptyButNotRequired = !isRequired && typeof value === 'string' && value === ''
    const isUndefinedButNotRequired = !isRequired && value === undefined
    const isValidText = typeof value === 'string' && regex.test(value)
    const isValid = isEmptyButNotRequired || isUndefinedButNotRequired || isValidText || isBoolean
    if (!isValid) errorMessage = value === '' ? `${label} is required` : `${label} is invalid, "${value}" should match ${String(regex)}`
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
  const hasChanged = !objectEqual(form, updatedForm, true)
  return { hasChanged, updatedForm }
}

export function createTextField(
  parameters: Partial<Pick<FormFieldText, 'columns' | 'isRequired' | 'isValid' | 'isVisible' | 'link' | 'regex' | 'unit' | 'value'>> & Pick<FormFieldText, 'label'> & { maxLength?: number; minLength?: number },
) {
  const { columns = 1, isRequired = false, isValid = false, isVisible = true, label, link = '', maxLength = 100, minLength = 3, regex, unit = '', value = '' } = parameters
  return {
    columns,
    isRequired,
    isValid,
    isVisible,
    label,
    link,
    regex: fieldRegex(regex, minLength, maxLength),
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
