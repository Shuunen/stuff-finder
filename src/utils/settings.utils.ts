import { type Form, createTextField } from './forms.utils'
import { state } from './state.utils'

export const settingsForm = {
  errorMessage: 'Airtable personal access token is required', // this is the default error message when the form is empty
  fields: {
    /* eslint-disable perfectionist/sort-objects */
    base: createTextField({ isRequired: true, label: 'Airtable base', link: 'https://airtable.com/api', regex: /^app\w{14}$/u, value: state.credentials.base }),
    table: createTextField({ isRequired: true, label: 'Airtable table', regex: /^[\w-]{3,100}$/u, value: state.credentials.table }),
    view: createTextField({ isRequired: true, label: 'Airtable view', regex: /^[\w-]{3,100}$/u, value: state.credentials.view }),
    token: createTextField({ isRequired: true, label: 'Airtable personal access token', link: 'https://airtable.com/create/tokens', regex: /^pat[\w.]{50,100}$/u, value: state.credentials.token }),
    wrap: createTextField({ isValid: true, label: 'Wrap api key', link: 'https://wrapapi.com/user/api', regex: /^\w{32}$/u, value: state.credentials.wrap }),
    /* eslint-enable perfectionist/sort-objects */
  },
  isTouched: false,
  isValid: false,
} satisfies Form

