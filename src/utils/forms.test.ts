import { clone } from 'shuutils'
import { expect, it } from 'vitest'
import { alignClipboard, createCheckboxField, createSelectField, optionsToLabels, validateForm } from './forms.utils'
import { settingsForm } from './settings.utils'

it('validateForm A invalid field value', () => {
  const form = {
    ...settingsForm,
    fields: {
      ...settingsForm.fields,
      bucketId: { ...settingsForm.fields.bucketId, value: 'azerty' },
    },
  }
  const { hasChanged, updatedForm } = validateForm(form)
  expect(updatedForm).toMatchSnapshot()
  expect(hasChanged).toBe(false)
  expect(updatedForm.isValid).toBe(false)
  expect(updatedForm.errorMessage).toMatchInlineSnapshot(`"AppWrite database id is required"`)
})

it('validateForm B valid form', () => {
  const form = {
    ...settingsForm,
    fields: {
      bucketId: { ...settingsForm.fields.bucketId, value: 'some-nice-bucket-uuid' },
      collectionId: { ...settingsForm.fields.collectionId, value: 'some-nice-collection-uuid' },
      databaseId: { ...settingsForm.fields.databaseId, value: 'some-nice-database-uuid' },
    },
  }
  const { hasChanged, updatedForm } = validateForm(form)
  expect(updatedForm).toMatchSnapshot()
  expect(hasChanged).toBe(true)
  expect(updatedForm.errorMessage).toBe('')
  expect(updatedForm.isValid).toBe(true)
})

it('validateForm C empty cases', () => {
  const settingsFormAlternative = clone(settingsForm)
  settingsFormAlternative.fields.bucketId.isRequired = false
  settingsFormAlternative.fields.collectionId.isRequired = false
  const form = {
    ...settingsFormAlternative,
    fields: {
      bucketId: { ...settingsFormAlternative.fields.bucketId, value: '' },
      collectionId: { ...settingsFormAlternative.fields.collectionId, value: undefined },
      databaseId: { ...settingsFormAlternative.fields.databaseId, value: 'some-nice-database-uuid' },
    },
  }
  // @ts-expect-error for testing purposes
  const { hasChanged, updatedForm } = validateForm(form)
  expect(updatedForm).toMatchSnapshot()
  expect(hasChanged).toBe(true)
  expect(updatedForm.isValid).toBe(true)
  expect(updatedForm.errorMessage).toMatchInlineSnapshot(`""`)
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

it('alignClipboard A Google Shit edition :(', () => {
  expect(alignClipboard(`"{
  ""base"": ""app123456"",
  ""token"": ""pat123456"",
  ""table"": ""stuff-finder"",
  ""view"": ""stuff-finder"",
  ""wrap"": ""123456""
}"`)).toBe(`{
  "base": "app123456",
  "token": "pat123456",
  "table": "stuff-finder",
  "view": "stuff-finder",
  "wrap": "123456"
}`)
})

it('alignClipboard B empty fields', () => {
  expect(alignClipboard(`{
    "details": "",
    name: "Jojo",
    age: "",
    golden: ""
  }`)).toBe(`{
    "details": "",
    name: "Jojo",
    age: "",
    golden: ""
  }`)
})
