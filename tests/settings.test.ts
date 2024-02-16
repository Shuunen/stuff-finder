import { expect, it } from 'vitest'
import { validateForm } from '../src/utils/forms.utils'
import { settingsForm } from '../src/utils/settings.utils'

it('validateForm A default settingsForm is not changed & not valid', () => {
  const { hasChanged, updatedForm } = validateForm(settingsForm)
  expect(updatedForm).toMatchSnapshot()
  expect(updatedForm.isTouched).toBe(false)
  expect(updatedForm.isValid).toBe(false)
  expect(updatedForm.errorMessage).toMatchInlineSnapshot('"Airtable view is required"')
  expect(updatedForm).toStrictEqual(settingsForm)
  expect(hasChanged).toBe(false)
})
