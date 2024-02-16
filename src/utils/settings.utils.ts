import { createTextField, type Form } from './forms.utils'
import { state } from './state.utils'

export const settingsForm = {
  errorMessage: 'Airtable view is required', // this is the default error message when the form is empty
  fields: {
    base: createTextField({ isRequired: true, label: 'Airtable base', link: 'https://airtable.com/api', regex: /^app\w{14}$/u, value: state.credentials.base }),
    token: createTextField({ isRequired: true, label: 'Airtable personal access token', link: 'https://airtable.com/create/tokens', regex: /^pat[\w.]{50,100}$/u, value: state.credentials.token }), // eslint-disable-next-line perfectionist/sort-objects
    table: createTextField({ isRequired: true, label: 'Airtable table', regex: /^[\w-]{3,100}$/u, value: state.credentials.table }),
    view: createTextField({ isRequired: true, label: 'Airtable view', regex: /^[\w-]{3,100}$/u, value: state.credentials.view }),
    wrap: createTextField({ isValid: true, label: 'Wrap api key', link: 'https://wrapapi.com/user/api', regex: /^\w{32}$/u, value: state.credentials.wrap }),
  },
  isTouched: false,
  isValid: false,
} satisfies Form

