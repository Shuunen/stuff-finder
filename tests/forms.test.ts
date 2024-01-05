/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect, it } from 'vitest' // eslint-disable-line @typescript-eslint/no-shadow
import { validateForm, type Form } from '../src/utils/forms.utils'
import { settingsForm } from '../src/utils/settings.utils'

it('validateForm A invalid field value', () => {
  const form: Form = { ...settingsForm, fields: { ...settingsForm.fields, base: { ...settingsForm.fields.base!, value: 'azerty' } } }
  const { hasChanged, updatedForm } = validateForm(form)
  expect(updatedForm).toMatchSnapshot()
  expect(hasChanged).toBe(false)
  expect(updatedForm.isValid).toBe(false)
  // even if the base field is invalid, the error message is the last invalid field error message
  expect(updatedForm.errorMessage).toMatchInlineSnapshot('"Airtable view is required"')
})

it('validateForm B valid form', () => {
  const form: Form = {
    ...settingsForm,
    fields: {
      base: { ...settingsForm.fields.base!, value: 'app1238479649646a' },
      table: { ...settingsForm.fields.table!, value: 'my-table' },
      token: { ...settingsForm.fields.token!, value: 'pat12345654987123azdazdzadazdzadaz465465468479649646azd46az465azdazd' },
      view: { ...settingsForm.fields.view!, value: 'my-view' },
      wrap: { ...settingsForm.fields.wrap!, value: '13246874kpohj4987_azdzad13546354' },
    },
  }
  const { hasChanged, updatedForm } = validateForm(form)
  expect(updatedForm).toMatchSnapshot()
  expect(hasChanged).toBe(true)
  expect(updatedForm.isValid).toBe(true)
  expect(updatedForm.errorMessage).toBe('')
})
