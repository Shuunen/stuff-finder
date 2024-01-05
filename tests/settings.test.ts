import { expect, it } from 'vitest' // eslint-disable-line @typescript-eslint/no-shadow
import { settingsForm, validateForm } from '../src/utils/settings.utils'

it('validateForm A default form', () => {
  const { hasChanged, updatedForm } = validateForm(settingsForm)
  expect(updatedForm).toMatchSnapshot()
  expect(updatedForm.isValid).toMatchInlineSnapshot('false')
  expect(updatedForm.errorMessage).toMatchInlineSnapshot('"Field view is required"')
  expect(hasChanged).toMatchInlineSnapshot('false')
})

it('validateForm B invalid field value', () => {
  const form = { ...settingsForm, fields: { ...settingsForm.fields, base: { ...settingsForm.fields.base, value: 'azerty' } } }
  const { hasChanged, updatedForm } = validateForm(form)
  expect(updatedForm).toMatchSnapshot()
  expect(hasChanged).toMatchInlineSnapshot('false')
  expect(updatedForm.isValid).toMatchInlineSnapshot('false')
  // even if the base field is invalid, the error message is the last invalid field error message
  expect(updatedForm.errorMessage).toMatchInlineSnapshot('"Field view is required"')
})

it('validateForm C valid form', () => {
  const form = {
    ...settingsForm,
    fields: {
      ...settingsForm.fields,
      base: { ...settingsForm.fields.base, value: 'app1238479649646a' },
      table: { ...settingsForm.fields.table, value: 'my-table' },
      token: { ...settingsForm.fields.token, value: 'pat12345654987123azdazdzadazdzadaz465465468479649646azd46az465azdazd' },
      view: { ...settingsForm.fields.view, value: 'my-view' },
      wrap: { ...settingsForm.fields.wrap, value: '13246874kpohj4987_azdzad13546354' },
    },
  }
  const { hasChanged, updatedForm } = validateForm(form)
  expect(updatedForm).toMatchSnapshot()
  expect(hasChanged).toMatchInlineSnapshot('true')
  expect(updatedForm.isValid).toMatchInlineSnapshot('true')
  expect(updatedForm.errorMessage).toMatchInlineSnapshot('""')
})
