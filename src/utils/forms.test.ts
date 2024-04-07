import { expect, it } from 'vitest'
import { createCheckboxField, createSelectField, optionsToLabels, validateForm } from './forms.utils'
import { settingsForm } from './settings.utils'

it('validateForm A invalid field value', () => {
  const form = { ...settingsForm, fields: { ...settingsForm.fields, base: { ...settingsForm.fields.base, value: 'azerty' } } }
  const { hasChanged, updatedForm } = validateForm(form)
  expect(updatedForm).toMatchSnapshot()
  expect(hasChanged).toBe(false)
  expect(updatedForm.isValid).toBe(false)
  expect(updatedForm.errorMessage).toMatchInlineSnapshot('"Airtable view is required"')
})

it('validateForm B valid form', () => {
  const form = {
    ...settingsForm,
    fields: {
      base: { ...settingsForm.fields.base, value: 'app1238479649646a' },
      table: { ...settingsForm.fields.table, value: 'my-table' },
      token: { ...settingsForm.fields.token, value: 'pat12345654987123azdazdzadazdzadaz465465468479649646azd46az465azdazd' },
      view: { ...settingsForm.fields.view, value: 'my-view' },
      wrap: { ...settingsForm.fields.wrap, value: '13246874azerty4987_pools13546354' },
    },
  }
  const { hasChanged, updatedForm } = validateForm(form)
  expect(updatedForm).toMatchSnapshot()
  expect(hasChanged).toBe(true)
  expect(updatedForm.isValid).toBe(true)
  expect(updatedForm.errorMessage).toBe('')
})

it('createCheckboxField A with a link', () => {
  expect(createCheckboxField({ label: 'label', link: 'https://example.com' })).toMatchSnapshot()
})

it('createSelectField A with a link', () => {
  expect(createSelectField({ label: 'label', link: 'https://example.com', options: [] })).toMatchSnapshot()
})

it('optionsToLabels A empty', () => {
  expect(optionsToLabels()).toEqual([])
})

it('optionsToLabels B with values', () => {
  expect(optionsToLabels([{ label: 'labelUp', value: 'value' }])).toEqual(['labelUp'])
})
