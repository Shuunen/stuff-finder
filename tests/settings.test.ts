import { expect, it } from 'vitest' // eslint-disable-line @typescript-eslint/no-shadow
import { validateForm } from '../src/utils/forms.utils'
import { settingsForm } from '../src/utils/settings.utils'

it('validateForm A default settingsForm is not changed but invalid', () => {
  const { hasChanged, updatedForm } = validateForm(settingsForm)
  expect(updatedForm).toMatchSnapshot()
  expect(updatedForm.isValid).toBe(false)
  expect(updatedForm.errorMessage).toMatchInlineSnapshot('"Airtable view is required"')
  expect(hasChanged).toBe(false)
})
