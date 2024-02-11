import { expect, it } from 'vitest'
import { createCheckboxField, createSelectField, validateForm } from '../src/utils/forms.utils'
import { settingsForm } from '../src/utils/settings.utils'

it('validateForm A invalid field value', () => {
  const form = { ...settingsForm, fields: { ...settingsForm.fields, base: { ...settingsForm.fields.base, value: 'azerty' } } }
  const { hasChanged, updatedForm } = validateForm(form)
  expect(updatedForm).toMatchSnapshot()
  expect(hasChanged).toBe(true)
  expect(updatedForm.isValid).toBe(false)
  expect(updatedForm.errorMessage).toMatchInlineSnapshot('"Airtable base is invalid, "azerty" should match /^app\\w{14}$/u"')
})

it('validateForm B valid form', () => {
  const form = {
    ...settingsForm,
    fields: {
      base: { ...settingsForm.fields.base, value: 'app1238479649646a' },
      table: { ...settingsForm.fields.table, value: 'my-table' },
      token: { ...settingsForm.fields.token, value: 'pat12345654987123azdazdzadazdzadaz465465468479649646azd46az465azdazd' },
      view: { ...settingsForm.fields.view, value: 'my-view' },
      wrap: { ...settingsForm.fields.wrap, value: '13246874kpohj4987_azdzad13546354' },
    },
  }
  const { hasChanged, updatedForm } = validateForm(form)
  expect(updatedForm).toMatchSnapshot()
  expect(hasChanged).toBe(true)
  expect(updatedForm.isValid).toBe(true)
  expect(updatedForm.errorMessage).toBe('')
})

it('createCheckboxField A with a link', () => {
  expect(createCheckboxField({ label: 'label', link: 'https://example.com', order: 0 })).toMatchSnapshot()
})

it('createSelectField A with a link', () => {
  expect(createSelectField({ label: 'label', link: 'https://example.com', options: [], order: 0 })).toMatchSnapshot()
})
