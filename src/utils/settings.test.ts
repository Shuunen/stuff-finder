import { validateForm } from './forms.utils'
import { settingsForm } from './settings.utils'

describe('settingsForm', () => {
  it('validateForm A default settingsForm is not changed & not valid', () => {
    const { hasChanged, updatedForm } = validateForm(settingsForm)
    expect(updatedForm).toMatchSnapshot()
    expect(updatedForm.isTouched).toBe(false)
    expect(updatedForm.isValid).toBe(false)
    expect(updatedForm).toStrictEqual(settingsForm)
    expect(hasChanged).toBe(false)
  })
})
