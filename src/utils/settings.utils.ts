import type { Form } from './forms.utils'
import { state } from './state.utils'

export const settingsForm: Form = {
  errorMessage: 'Airtable view is required', // this is the default error message when the form is empty
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
} satisfies Form

