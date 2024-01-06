import { objectSum } from 'shuutils'

type FormField = {
  isRequired: boolean
  isValid: boolean
  label: string
  link?: string
  order: number
  regex: RegExp
  value: string
}

export type Form = {
  columns?: number
  errorMessage: string
  fields: Record<string, FormField>
  isTouched: boolean
  isValid: boolean
}

export function validateForm (form: Form) {
  let errorMessage = ''
  const updatedFields = Object.entries(form.fields).reduce((accumulator, [field, { isRequired, label, regex, value }]) => { // eslint-disable-line unicorn/no-array-reduce
    const isValid = (!isRequired && value === '') || regex.test(value)
    if (!isValid) errorMessage = value === '' ? `${label} is required` : `${label} is invalid, it should match ${String(regex)}`
    return { ...accumulator, [field]: { ...form.fields[field], isValid } }
  }, {})
  const isFormValid = errorMessage === ''
  const updatedForm: Form = { ...form, errorMessage, fields: updatedFields, isTouched: form.isTouched, isValid: isFormValid } satisfies Form
  const hasChanged = objectSum(form) !== objectSum(updatedForm)
  return { hasChanged, updatedForm } satisfies { hasChanged: boolean; updatedForm: Form }
}

export function createField ({ isRequired = false, isValid = false, label = '', link, maxLength = 100, minLength = 3, order = 0, regex, value = '' }: Partial<FormField> & { maxLength?: number; minLength?: number }) {
  const finalRegex = regex ?? new RegExp(`^[\\w-]{${minLength},${maxLength}}$`, 'u') // eslint-disable-line security/detect-non-literal-regexp
  const field: FormField = { isRequired, isValid, label, order, regex: finalRegex, value }
  if (link !== undefined) field.link = link
  return field
}
