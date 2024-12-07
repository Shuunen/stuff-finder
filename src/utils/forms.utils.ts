/* eslint-disable jsdoc/require-jsdoc */
import { objectEqual } from 'shuutils'

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
type FormFieldCheckbox = FormFieldBase & { type: 'checkbox'; value: boolean } // eslint-disable-line @typescript-eslint/naming-convention
type FormField<Type extends FormFieldType> = Type extends 'text' ? FormFieldText : Type extends 'select' ? FormFieldSelect : FormFieldCheckbox

function fieldRegex (regex?: RegExp, minLength = 3, maxLength = 100) {
  return regex ?? new RegExp(`^[-,\\d\\p{L}\\s/&]{${minLength},${maxLength}}$`, 'u')
}

export type Form = {
  columns?: number
  errorMessage: string
  fields: Record<string, FormField<FormFieldType>>
  isTouched: boolean
  isValid: boolean
}

export function validateForm<FormType extends Form> (form: FormType) {
  let errorMessage = ''
  const updatedFields = Object.entries(form.fields).reduce((accumulator, [field, { isRequired, label, regex, value }]) => { // eslint-disable-line unicorn/no-array-reduce
    const isValid = !isRequired && (typeof value === 'string' && value === '') || typeof value === 'string' && regex.test(value) || typeof value === 'boolean'
    if (!isValid) errorMessage = value === '' ? `${label} is required` : `${label} is invalid, "${String(value)}" should match ${String(regex)}`
    // biome-ignore lint/performance/noAccumulatingSpread: this whole validation is a joke, we should use a proper library
    return { ...accumulator, [field]: { ...form.fields[field], isValid } }
  }, {})
  const isFormValid = errorMessage === ''
  const updatedForm: FormType = { ...form, errorMessage, fields: updatedFields, isTouched: form.isTouched, isValid: isFormValid } satisfies FormType
  const hasChanged = !objectEqual(form, updatedForm, true)
  return { hasChanged, updatedForm }
}

// eslint-disable-next-line complexity
export function createTextField (parameters: Partial<Pick<FormFieldText, 'columns' | 'isRequired' | 'isValid' | 'isVisible' | 'link' | 'regex' | 'unit' | 'value'>> & Pick<FormFieldText, 'label'> & { maxLength?: number; minLength?: number }) {
  const { columns = 1, isRequired = false, isValid = false, isVisible = true, label = '', link = '', maxLength = 100, minLength = 3, regex, unit = '', value = '' } = parameters
  return { columns, isRequired, isValid, isVisible, label, link, regex: fieldRegex(regex, minLength, maxLength), type: 'text', unit, value } satisfies FormFieldText
}

export function createCheckboxField (parameters: Partial<Pick<FormFieldCheckbox, 'columns' | 'isRequired' | 'isValid' | 'isVisible' | 'link' | 'value'>> & Pick<FormFieldCheckbox, 'label'>) {
  const { columns = 1, isRequired = false, isValid = false, isVisible = true, label = '', link = '', value = false } = parameters // eslint-disable-line @typescript-eslint/naming-convention
  return { columns, isRequired, isValid, isVisible, label, link, regex: fieldRegex(), type: 'checkbox', unit: '', value } satisfies FormFieldCheckbox // eslint-disable-line @typescript-eslint/naming-convention
}

export function createSelectField (parameters: Partial<Pick<FormFieldSelect, 'columns' | 'isRequired' | 'isValid' | 'isVisible' | 'link' | 'regex' | 'value'>> & Pick<FormFieldSelect, 'label' | 'options'>) {
  const { columns = 1, isRequired = false, isValid = false, isVisible = true, label = '', link = '', options, regex, value = '' } = parameters
  return { columns, isRequired, isValid, isVisible, label, link, options, regex: fieldRegex(regex), type: 'select', unit: '', value } satisfies FormFieldSelect
}

export function optionsToLabels (values?: FormFieldOptions) {
  return values?.map(({ label }) => label) ?? []
}

export type { FormFieldCheckbox, FormFieldSelect, FormFieldText }


export function alignClipboard (text: string) {
  return text.replace(/: ""(?<thing>[,\n])/gu, ': "__EMPTY__"$<thing>')
    .replace(/""/gu, '"')
    .replace(/"__EMPTY__"/gu, '""')
    .replace('"{', '{')
    .replace('}"', '}') // need to replace double double quotes with single double quotes (Google Sheet issue -.-'''''')
}
