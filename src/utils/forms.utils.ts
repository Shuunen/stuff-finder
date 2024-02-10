import { objectEqual } from 'shuutils'

type FormFieldType = 'checkbox' | 'text'

type FormField<Type extends FormFieldType = 'text'> = {
  isRequired: boolean
  isValid: boolean
  label: string
  link?: string
  order: number
  regex: RegExp
  type: Type
  value: Type extends 'checkbox' ? boolean : string
}

function byOrder ([, { order: orderA }]: [string, FormField<FormFieldType>], [, { order: orderB }]: [string, FormField<FormFieldType>]) { return orderB - orderA }

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
    if (!isValid) errorMessage = value === '' ? `${label} is required` : `${label} is invalid, it should match ${String(regex)}`
    return { ...accumulator, [field]: { ...form.fields[field], isValid } }
  }, {})
  const isFormValid = errorMessage === ''
  const updatedForm: FormType = { ...form, errorMessage, fields: updatedFields, isTouched: form.isTouched, isValid: isFormValid } satisfies FormType
  const hasChanged = !objectEqual(form, updatedForm, true)
  return { hasChanged, updatedForm }
}

export function createField<Type extends FormFieldType> ({ isRequired = false, isValid = false, label = '', link, maxLength = 100, minLength = 3, order = 0, regex, type, value }: Partial<Pick<FormField<Type>, 'isRequired' | 'isValid' | 'link' | 'regex'>> & Pick<FormField<Type>, 'label' | 'order' | 'value'> & { maxLength?: number; minLength?: number; type: Type }) {
  const finalRegex = regex ?? new RegExp(`^[\\w\\s]{${minLength},${maxLength}}$`, 'u') // eslint-disable-line security/detect-non-literal-regexp
  const field: FormField<Type> = { isRequired, isValid, label, order, regex: finalRegex, type, value }
  if (link !== undefined) field.link = link
  return field
}

