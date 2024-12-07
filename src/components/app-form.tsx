import Button from '@mui/material/Button'
import { useSignalEffect } from '@preact/signals'
import { useCallback, useState } from 'preact/hooks'
import { debounce, off, on, parseJson, readClipboard } from 'shuutils'
import { delays, voidFunction } from '../constants'
import { type Form, alignClipboard, validateForm } from '../utils/forms.utils'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'
import { colSpanClass, gridClass } from '../utils/theme.utils'
import { AppFormFieldCheckbox } from './app-form-field-checkbox'
import { AppFormFieldSelect } from './app-form-field-select'
import { AppFormFieldText } from './app-form-field-text'

type Properties<FormType extends Form> = Readonly<{
  error?: string
  initialForm: FormType
  onChange?: (form: FormType) => void
  onSubmit?: ((form: FormType) => void) | undefined
  suggestions?: Record<string, string[]>
}>

// eslint-disable-next-line max-statements, unicorn/no-useless-undefined, max-lines-per-function, complexity
export function AppForm<FormType extends Form> ({ error: parentError = '', initialForm, onChange = voidFunction, onSubmit = undefined, suggestions }: Properties<FormType>) {

  const [form, setForm] = useState(initialForm)

  const { hasChanged, updatedForm } = validateForm(form)
  if (hasChanged) { onChange(updatedForm); setForm(updatedForm) }

  const onFormSubmit = useCallback((event: Event) => {
    event.preventDefault()
    onSubmit?.(form)
  }, [form, onSubmit])

  // eslint-disable-next-line max-statements
  function updateFieldSync (field: string, target: EventTarget | null, isFromClipboard = false) {
    if (target === null) throw new Error(`target for field "${field}" is null`)
    const input = target as HTMLInputElement // eslint-disable-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion
    let value = input.type === 'checkbox' ? input.checked : input.value
    if (input.role === 'option') value = input.textContent ?? '' // handle autocomplete target
    logger.debug('updateField', { field, value })
    const actualField = form.fields[field]
    if (actualField === undefined) throw new Error(`field "${field}" not found in form`)
    if (isFromClipboard) state.message = { content: `Pasted "${field}" field value`, delay: delays.second, type: 'success' }
    const updated = { ...form, fields: { ...form.fields, [field]: { ...actualField, value } }, isTouched: true }
    setForm(updated)
    onChange(updated)
  }

  const updateField = debounce(updateFieldSync, delays.small)

  // eslint-disable-next-line max-statements, complexity
  const checkDataInClipboard = useCallback(async () => {
    const clip = alignClipboard(await readClipboard())
    const { error, value: data } = parseJson(clip)
    if (error !== '' || typeof data !== 'object' || data === null) { logger.debug('error or data not an object', { data, error }); return }
    const futureForm = structuredClone(form)
    futureForm.isTouched = true
    const entries = Object.entries(data)
    for (const [key, value] of entries) {
      if (typeof key !== 'string' || typeof value !== 'string' || key === '' || value === '') continue
      const actualField = futureForm.fields[key]
      if (actualField === undefined) continue  // @ts-expect-error typing issue
      futureForm.fields[key] = { ...actualField, value }
    }
    setForm(futureForm)
  }, [form])

  useSignalEffect(useCallback(() => {
    const handler = on('focus', () => { void checkDataInClipboard() })
    void checkDataInClipboard()
    return () => { off(handler) }
  }, [checkDataInClipboard]))

  const errorMessage = parentError.length > 0 ? parentError : form.errorMessage
  const canSubmit = form.isValid && form.isTouched && errorMessage.length === 0

  return (
    <form autoComplete="off" class={`grid w-full gap-6 ${gridClass(form.columns)}`} noValidate onSubmit={onFormSubmit} spellcheck={false}>
      {Object.entries(form.fields).map(([id, field]) => <div class={`grid w-full ${field.isVisible ? '' : 'hidden'} ${colSpanClass(field.columns)}`} key={id}>
        {field.type === 'text' && <AppFormFieldText field={field} form={form} id={id} suggestions={suggestions} updateField={updateField} />}
        {field.type === 'checkbox' && <AppFormFieldCheckbox field={field} id={id} updateField={updateField} />}
        {field.type === 'select' && <AppFormFieldSelect field={field} form={form} id={id} updateField={updateField} />}
      </div>)}
      <div class="order-last flex flex-col md:col-span-full">
        {Boolean(errorMessage) && Boolean(form.isTouched) && <p class="text-red-500">{errorMessage}</p>}
        {onSubmit !== undefined && <Button disabled={!canSubmit} type="submit" variant="contained">Save</Button>}
      </div>
    </form>
  )
}
