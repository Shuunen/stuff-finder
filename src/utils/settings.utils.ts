import { objectSum } from 'shuutils'
import { state } from './state.utils'

type SettingFormField = {
  isRequired: boolean
  isValid: boolean
  label: string
  link?: string
  regex: RegExp
  value: string
}

type SettingForm = {
  errorMessage: string
  fields: {
    base: SettingFormField
    table: SettingFormField
    token: SettingFormField
    view: SettingFormField
    wrap: SettingFormField
  }
  isTouched: boolean
  isValid: boolean
}

export const settingsForm: SettingForm = {
  errorMessage: 'Field view is required', // this is the default error message when the form is empty
  fields: {
    base: {
      isRequired: true,
      isValid: false,
      label: 'Airtable base',
      link: 'https://airtable.com/api',
      regex: /^app\w{14}$/u,
      value: state.credentials.base,
    },
    table: {
      isRequired: true,
      isValid: false,
      label: 'Airtable table',
      regex: /^[\w-]+$/u,
      value: state.credentials.table,
    },
    token: {
      isRequired: true,
      isValid: false,
      label: 'Airtable personal access token',
      link: 'https://airtable.com/create/tokens',
      regex: /^pat[\w.]{50,100}$/u,
      value: state.credentials.token,
    },
    view: {
      isRequired: true,
      isValid: false,
      label: 'Airtable view',
      regex: /^[\w-]+$/u,
      value: state.credentials.view,
    },
    wrap: {
      isRequired: false,
      isValid: true,
      label: 'Wrap api key',
      link: 'https://wrapapi.com/user/api',
      regex: /^\w{32}$/u,
      value: state.credentials.wrap,
    },
  },
  isTouched: false,
  isValid: false,
}

export type SettingFormFieldName = keyof typeof settingsForm.fields

export function validateForm (form: SettingForm) {
  let errorMessage = ''
  const updatedFields: Record<SettingFormFieldName, SettingFormField> = Object.entries(form.fields).reduce((accumulator, [field, { isRequired, regex, value }]) => { // eslint-disable-line unicorn/no-array-reduce
    const isValid = (!isRequired && value === '') || regex.test(value)
    const name = field as SettingFormFieldName // eslint-disable-line @typescript-eslint/consistent-type-assertions
    if (!isValid) errorMessage = value === '' ? `Field ${name} is required` : `Field ${name} is invalid`
    return { ...accumulator, [name]: { ...form.fields[name], isValid } }
  }, {} as Record<SettingFormFieldName, SettingFormField>) // eslint-disable-line @typescript-eslint/prefer-reduce-type-parameter, @typescript-eslint/consistent-type-assertions
  const isFormValid = errorMessage === ''
  const updatedForm = { errorMessage, fields: updatedFields, isTouched: form.isTouched, isValid: isFormValid } satisfies SettingForm
  const hasChanged = objectSum(form) !== objectSum(updatedForm)
  return { hasChanged, updatedForm }
}
