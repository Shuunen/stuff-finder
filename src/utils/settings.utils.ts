import { createField, type Form } from './forms.utils'
import { state } from './state.utils'

export const settingsForm = {
  errorMessage: 'Airtable view is required', // this is the default error message when the form is empty
  fields: {
    base: createField({ isRequired: true, label: 'Airtable base', link: 'https://airtable.com/api', order: 10, regex: /^app\w{14}$/u, value: state.credentials.base }),
    table: createField({ isRequired: true, label: 'Airtable table', order: 30, value: state.credentials.table }),
    token: createField({ isRequired: true, label: 'Airtable personal access token', link: 'https://airtable.com/create/tokens', order: 20, regex: /^pat[\w.]{50,100}$/u, value: state.credentials.token }),
    view: createField({ isRequired: true, label: 'Airtable view', order: 40, value: state.credentials.view }),
    wrap: createField({ isValid: true, label: 'Wrap api key', link: 'https://wrapapi.com/user/api', order: 50, regex: /^\w{32}$/u, value: state.credentials.wrap }),
  },
  isTouched: false,
  isValid: false,
} satisfies Form

