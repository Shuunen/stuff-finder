import { objectEqual } from 'shuutils'

type FormFieldType = 'checkbox' | 'select' | 'text'
type FormFieldOptions = { label: string; value: string }[]
type FormFieldBase = {
  isRequired: boolean
  isValid: boolean
  label: string
  link: string
  options?: FormFieldOptions
  order: number
  regex: RegExp
  unit: string
}
type FormFieldText = FormFieldBase & { type: 'text'; value: string }
type FormFieldSelect = FormFieldBase & { options: FormFieldOptions; type: 'select'; value: string }
type FormFieldCheckbox = FormFieldBase & { type: 'checkbox'; value: boolean } // eslint-disable-line @typescript-eslint/naming-convention
type FormField<Type extends FormFieldType> = Type extends 'text' ? FormFieldText : Type extends 'select' ? FormFieldSelect : FormFieldCheckbox

function byOrder ([, { order: orderA }]: [string, FormField<FormFieldType>], [, { order: orderB }]: [string, FormField<FormFieldType>]) { return orderB - orderA }

function fieldRegex (regex?: RegExp, minLength = 3, maxLength = 100) {
  return regex ?? new RegExp(`^[\\d\\p{L}\\s/&]{${minLength},${maxLength}}$`, 'u') // eslint-disable-line security/detect-non-literal-regexp
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
  const updatedFields = Object.entries(form.fields).sort(byOrder).reduce((accumulator, [field, { isRequired, label, regex, value }]) => { // eslint-disable-line unicorn/no-array-reduce
    const isValid = (!isRequired && (typeof value === 'string' && value === '')) || (typeof value === 'string' && regex.test(value)) || (typeof value === 'boolean')
    if (!isValid) errorMessage = value === '' ? `${label} is required` : `${label} is invalid, "${String(value)}" should match ${String(regex)}`
    return { ...accumulator, [field]: { ...form.fields[field], isValid } }
  }, {})
  const isFormValid = errorMessage === ''
  const updatedForm: FormType = { ...form, errorMessage, fields: updatedFields, isTouched: form.isTouched, isValid: isFormValid } satisfies FormType
  const hasChanged = !objectEqual(form, updatedForm, true)
  return { hasChanged, updatedForm }
}

export function createTextField (parameters: Partial<Pick<FormFieldText, 'isRequired' | 'isValid' | 'link' | 'regex' | 'unit' | 'value'>> & Pick<FormFieldText, 'label' | 'order'> & { maxLength?: number; minLength?: number }) {
  const { isRequired = false, isValid = false, label = '', link = '', maxLength = 100, minLength = 3, order = 0, regex, unit = '', value = '' } = parameters
  return { isRequired, isValid, label, link, order, regex: fieldRegex(regex, minLength, maxLength), type: 'text', unit, value } satisfies FormFieldText
}

export function createCheckboxField (parameters: Partial<Pick<FormFieldCheckbox, 'isRequired' | 'isValid' | 'link' | 'value'>> & Pick<FormFieldCheckbox, 'label' | 'order'>) {
  const { isRequired = false, isValid = false, label = '', link = '', order = 0, value = false } = parameters // eslint-disable-line @typescript-eslint/naming-convention
  return { isRequired, isValid, label, link, order, regex: fieldRegex(), type: 'checkbox', unit: '', value } satisfies FormFieldCheckbox // eslint-disable-line @typescript-eslint/naming-convention
}

export function createSelectField (parameters: Partial<Pick<FormFieldSelect, 'isRequired' | 'isValid' | 'link' | 'regex' | 'value'>> & Pick<FormFieldSelect, 'label' | 'options' | 'order'>) {
  const { isRequired = false, isValid = false, label = '', link = '', options, order = 0, regex, value = '' } = parameters
  return { isRequired, isValid, label, link, options, order, regex: fieldRegex(regex), type: 'select', unit: '', value } satisfies FormFieldSelect
}
