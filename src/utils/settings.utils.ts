import { type Form, createTextField } from './forms.utils'
import { state } from './state.utils'

export const settingsForm = {
  errorMessage: 'AppWrite database id is required', // this is the default error message when the form is empty
  fields: {
    bucketId: createTextField({ isRequired: true, label: 'AppWrite storage bucket id', link: 'https://appwrite.io/', regex: /^[\w-]{20,100}$/u, value: state.credentials.bucketId }),
    collectionId: createTextField({ isRequired: true, label: 'AppWrite collection id', regex: /^[\w-]{20,100}$/u, value: state.credentials.collectionId }),
    databaseId: createTextField({ isRequired: true, label: 'AppWrite database id', regex: /^[\w-]{20,100}$/u, value: state.credentials.databaseId }),
  },
  isTouched: false,
  isValid: false,
} satisfies Form

