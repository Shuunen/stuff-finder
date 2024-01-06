import { expect, it } from 'vitest' // eslint-disable-line @typescript-eslint/no-shadow
import { validateForm } from '../src/utils/forms.utils'
import { settingsForm } from '../src/utils/settings.utils'

it('validateForm A default settingsForm is not changed & not valid', () => {
  const { hasChanged, updatedForm } = validateForm(settingsForm)
  expect(updatedForm).toMatchSnapshot()
  expect(updatedForm.isValid).toBe(false)
  expect(updatedForm.errorMessage).toMatchInlineSnapshot('"Airtable base is required"')
  expect(updatedForm).toStrictEqual(settingsForm)
  expect(hasChanged).toBe(false)
})
