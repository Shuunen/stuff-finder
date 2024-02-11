import { objectEqual } from 'shuutils'
import { logger } from './logger.utils'

type FormFieldType = 'checkbox' | 'select' | 'text'

type FormFieldOptions = { label: string; value: string }[]

type FormFieldBase = {
  isRequired: boolean
  isValid: boolean
  label: string
  link?: string
  options?: FormFieldOptions
  order: number
  regex: RegExp
}

type FormFieldText = FormFieldBase & {
  type: 'text'
  value: string
}

type FormFieldSelect = FormFieldBase & {
  options: FormFieldOptions
  type: 'select'
  value: string
}

type FormFieldCheckbox = FormFieldBase & {
  type: 'checkbox'
  value: boolean // eslint-disable-line @typescript-eslint/naming-convention
}

type FormField<Type extends FormFieldType> = Type extends 'text' ? FormFieldText : Type extends 'select' ? FormFieldSelect : FormFieldCheckbox

function byOrder ([, { order: orderA }]: [string, FormField<FormFieldType>], [, { order: orderB }]: [string, FormField<FormFieldType>]) { return orderB - orderA }

function fieldRegex (regex?: RegExp, minLength = 3, maxLength = 100) {
  return regex ?? new RegExp(`^[\\w\\s]{${minLength},${maxLength}}$`, 'u') // eslint-disable-line security/detect-non-literal-regexp
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

export function createTextField (parameters: Partial<Pick<FormFieldText, 'isRequired' | 'isValid' | 'link' | 'regex' | 'value'>> & Pick<FormFieldText, 'label' | 'order'> & { maxLength?: number; minLength?: number }) {
  const { isRequired = false, isValid = false, label = '', link, maxLength = 100, minLength = 3, order = 0, regex, value = '' } = parameters
  const field: FormFieldText = { isRequired, isValid, label, order, regex: fieldRegex(regex, minLength, maxLength), type: 'text', value }
  if (link !== undefined) field.link = link
  return field
}

export function createCheckboxField (parameters: Partial<Pick<FormFieldCheckbox, 'isRequired' | 'isValid' | 'link' | 'value'>> & Pick<FormFieldCheckbox, 'label' | 'order'>) {
  const { isRequired = false, isValid = false, label = '', link, order = 0, value = false } = parameters // eslint-disable-line @typescript-eslint/naming-convention
  const field: FormFieldCheckbox = { isRequired, isValid, label, order, regex: fieldRegex(), type: 'checkbox', value } // eslint-disable-line @typescript-eslint/naming-convention
  if (link !== undefined) field.link = link
  return field
}

export function createSelectField (parameters: Partial<Pick<FormFieldSelect, 'isRequired' | 'isValid' | 'link' | 'regex' | 'value'>> & Pick<FormFieldSelect, 'label' | 'options' | 'order'>) {
  const { isRequired = false, isValid = false, label = '', link, options, order = 0, regex, value = '' } = parameters
  logger.debug('createSelectField', { isRequired, isValid, label, link, options, order, value })
  const field: FormFieldSelect = { isRequired, isValid, label, options, order, regex: fieldRegex(regex), type: 'select', value }
  if (link !== undefined) field.link = link
  return field
}
