import { clone } from 'shuutils'
import { alignClipboard, createCheckboxField, createSelectField, createTextField, getFieldError, optionsToLabels, updateForm, validateForm } from './forms.utils'
import { settingsForm } from './settings.utils'

describe('forms.utils', () => {
  it('updateForm A should update form fields with valid values', () => {
    const form = clone(settingsForm)
    const updatedFields = { bucketId: 'new-bucket-id', collectionId: 'new-collection-id' }
    const { hasChanged, updatedForm } = updateForm(form, updatedFields)
    expect(hasChanged).toBe(true)
    expect(updatedForm.isTouched).toBe(true)
    expect(updatedForm.fields.bucketId.value).toBe('new-bucket-id')
    expect(updatedForm.fields.collectionId.value).toBe('new-collection-id')
  })

  it('updateForm B should skip invalid field keys', () => {
    const form = clone(settingsForm)
    const updatedFields = { '': 'empty-key', nonExistentField: 'some-value' }
    const { hasChanged, updatedForm } = updateForm(form, updatedFields)
    expect(hasChanged).toBe(true)
    expect(updatedForm.isTouched).toBe(true)
    expect(updatedForm.fields.bucketId.value).toBe('')
  })

  it('updateForm C should skip invalid values', () => {
    const form = clone(settingsForm)
    const updatedFields = { bucketId: '' }
    const { hasChanged, updatedForm } = updateForm(form, updatedFields)
    expect(hasChanged).toBe(true)
    expect(updatedForm.isTouched).toBe(true)
    expect(updatedForm.fields.bucketId.value).toBe('')
  })

  it('updateForm D should update only existing fields', () => {
    const form = clone(settingsForm)
    const updatedFields = { bucketId: 'valid-bucket', nonExistentField: 'ignored-value' }
    const { hasChanged, updatedForm } = updateForm(form, updatedFields)
    expect(hasChanged).toBe(true)
    expect(updatedForm.isTouched).toBe(true)
    expect(updatedForm.fields.bucketId.value).toBe('valid-bucket')
    expect(updatedForm.fields).not.toHaveProperty('nonExistentField')
  })

  it('updateForm E should handle checkbox fields properly', () => {
    const formWithCheckbox = {
      ...settingsForm,
      fields: {
        ...settingsForm.fields,
        acceptTerms: createCheckboxField({ label: 'Accept Terms' }),
      },
    }
    const updatedFields = { acceptTerms: 'true', bucketId: 'valid-bucket' }
    const { hasChanged, updatedForm } = updateForm(formWithCheckbox, updatedFields)
    expect(hasChanged).toBe(true)
    expect(updatedForm.isTouched).toBe(true)
    expect(updatedForm.fields.acceptTerms.value).toBe(true)
    expect(updatedForm.fields.bucketId.value).toBe('valid-bucket')
  })

  it('updateForm F should convert false string to boolean for checkbox', () => {
    const formWithCheckbox = {
      ...settingsForm,
      fields: {
        ...settingsForm.fields,
        acceptTerms: createCheckboxField({ label: 'Accept Terms', value: true }),
      },
    }
    const updatedFields = { acceptTerms: 'false' }
    const { hasChanged, updatedForm } = updateForm(formWithCheckbox, updatedFields)
    expect(hasChanged).toBe(true)
    expect(updatedForm.isTouched).toBe(true)
    expect(updatedForm.fields.acceptTerms.value).toBe(false)
  })

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

  it('createTextField A default regex accepts the usual product text', () => {
    const field = createTextField({ label: 'label', maxLength: 200 })
    for (const text of ["DAB+/FM, radio d'urgence", 'radio d’urgence 50% (noir) : 15" 20° 5m² 2×3 – ok!', 'HP', '3M', 'Zeiss']) expect(getFieldError({ ...field, value: text })).toBeUndefined()
  })

  it('createTextField B field with its own regex has no length rule', () => {
    const field = createTextField({ label: 'label', maxLength: 5, regex: /^.+$/u })
    expect(field.maxLength).toBeUndefined()
    expect(getFieldError({ ...field, value: 'a very long value' })).toBeUndefined()
  })

  it('getFieldError A required', () => {
    const field = createTextField({ label: 'Name' })
    expect(getFieldError({ ...field, value: '' })).toBe('Name is required')
    expect(getFieldError({ ...field, value: undefined })).toBe('Name is required')
  })

  it('getFieldError B too long', () => {
    const field = createTextField({ label: 'Name', maxLength: 5 })
    expect(getFieldError({ ...field, value: 'abcdef' })).toBe('Name is too long (6 characters, 5 max)')
  })

  it('getFieldError C too short', () => {
    const field = createTextField({ label: 'Name', minLength: 3 })
    expect(getFieldError({ ...field, value: 'ab' })).toBe('Name is too short (2 characters, 3 min)')
    expect(getFieldError({ ...field, value: 'a' })).toBe('Name is too short (1 character, 3 min)')
  })

  it('getFieldError D spaces around and blank', () => {
    const field = createTextField({ label: 'Name' })
    expect(getFieldError({ ...field, value: ' abc' })).toBe('Name should not start or end with a space')
    expect(getFieldError({ ...field, value: 'abc ' })).toBe('Name should not start or end with a space')
    expect(getFieldError({ ...field, value: '   ' })).toBe('Name should not start or end with a space')
  })

  it('getFieldError E forbidden characters', () => {
    const field = createTextField({ label: 'Details' })
    expect(getFieldError({ ...field, value: 'tab\there\nnew line\tagain' })).toBe(String.raw`Details contains characters that are not allowed : "\t" "\n"`)
    expect(getFieldError({ ...field, value: '<b>+|~$^`=</b>' })).toBeUndefined()
  })

  it('getFieldError F own regex with a hint', () => {
    const field = createTextField({ hint: 'use whole euros', label: 'Price', regex: /^\d{1,5}$/u })
    expect(getFieldError({ ...field, value: '12,5' })).toBe('Price is invalid, "12,5", use whole euros')
    expect(getFieldError({ ...field, value: '12' })).toBeUndefined()
    expect(getFieldError({ ...createTextField({ label: 'Photo', regex: /^\d$/u }), value: 'x' })).toBe('Photo is invalid, "x"')
  })

  it('getFieldError G survives a structured clone of the form', () => {
    const field = structuredClone(createTextField({ label: 'Details' }))
    expect(getFieldError({ ...field, value: 'a\tb' })).toBe(String.raw`Details contains characters that are not allowed : "\t"`)
  })

  it('optionsToLabels A empty', () => {
    expect(optionsToLabels()).toStrictEqual([])
  })

  it('optionsToLabels B with values', () => {
    expect(optionsToLabels([{ label: 'labelUp', value: 'value' }])).toStrictEqual(['labelUp'])
  })

  it('alignClipboard A Google Shit edition :(', () => {
    expect(
      alignClipboard(`"{
  ""base"": ""app123456"",
  ""token"": ""pat123456"",
  ""table"": ""stuff-finder"",
  ""view"": ""stuff-finder"",
  ""wrap"": ""123456""
}"`),
    ).toBe(`{
  "base": "app123456",
  "token": "pat123456",
  "table": "stuff-finder",
  "view": "stuff-finder",
  "wrap": "123456"
}`)
  })

  it('alignClipboard B empty fields', () => {
    expect(
      alignClipboard(`{
    "details": "",
    name: "Jojo",
    age: "",
    golden: ""
  }`),
    ).toBe(`{
    "details": "",
    name: "Jojo",
    age: "",
    golden: ""
  }`)
  })
})
