
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import TextField from '@mui/material/TextField'
import { useSignalEffect } from '@preact/signals'
import { useState } from 'preact/hooks'
import { debounce, off, on, parseJson, readClipboard } from 'shuutils'
import { delays, voidFunction } from '../constants'
import { optionsToLabels, validateForm, type Form } from '../utils/forms.utils'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'
import { colSpanClass, gridClass } from '../utils/theme.utils'

type Properties<FormType extends Form> = {
  readonly error?: string
  readonly initialForm: FormType
  readonly onChange?: (form: FormType) => void
  readonly onSubmit?: ((form: FormType) => void) | undefined
  readonly suggestions?: Record<string, string[]>
}

// eslint-disable-next-line max-statements, unicorn/no-useless-undefined
export function AppForm<FormType extends Form> ({ error: parentError = '', initialForm, onChange = voidFunction, onSubmit = undefined, suggestions = {} }: Properties<FormType>) {

  const [form, setForm] = useState(initialForm)

  const { hasChanged, updatedForm } = validateForm(form)
  if (hasChanged) { onChange(updatedForm); setForm(updatedForm) }

  function onFormSubmit (event: Event) {
    event.preventDefault()
    onSubmit?.(form)
  }

  function updateFieldSync (field: string, target: EventTarget, isFromClipboard = false) {
    const input = target as HTMLInputElement // eslint-disable-line @typescript-eslint/consistent-type-assertions
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

  async function checkDataInClipboard () {
    const clip = await readClipboard()
    const clean = clip.replace(/""/gu, '"').replace('"{', '{').replace('}"', '}') // need to replace double double quotes with single double quotes (Google Sheet issue -.-'''''')
    const { error, value: data } = parseJson(clean)
    if (error !== '' || typeof data !== 'object' || data === null) { logger.debug('error or data not an object', { data, error }); return }
    const futureForm = structuredClone(form)
    futureForm.isTouched = true
    Object.entries(data).forEach(([key, value]) => {
      if (typeof key !== 'string' || typeof value !== 'string' || key === '' || value === '') return
      const actualField = futureForm.fields[key]
      if (actualField === undefined) return // @ts-expect-error typing issue
      futureForm.fields[key] = { ...actualField, value }
    })
    setForm(futureForm)
  }

  useSignalEffect(() => {
    const handler = on('focus', () => { void checkDataInClipboard() }, window)
    void checkDataInClipboard()
    return () => { if (handler !== false) off(handler) }
  })

  const errorMessage = parentError.length > 0 ? parentError : form.errorMessage
  const canSubmit = form.isValid && form.isTouched && errorMessage.length === 0

  return (
    <form autoComplete="off" className={`grid w-full gap-6 ${gridClass(form.columns)}`} noValidate onSubmit={onFormSubmit} spellCheck={false}>{ }
      {Object.entries(form.fields).map(([field, { columns, isRequired, isValid, isVisible, label, options, type, value }]) => (
        <div className={`grid w-full ${isVisible ? '' : 'hidden'} ${colSpanClass(columns)}`} key={field}>{/* @ts-expect-error typing issue */}{/* eslint-disable-next-line react/jsx-props-no-spreading, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */}
          {type === 'text' && <Autocomplete freeSolo id={field} onChange={event => { logger.info(event); void updateField(field, event.target) }} options={suggestions[field] ?? []} renderInput={(parameters) => <TextField {...parameters} error={Boolean(form.isTouched) && !isValid} label={label} onChange={event => { logger.info(event); void updateField(field, event.target) }} required={isRequired} value={value} variant="standard" />} value={value} />}{/* eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */}
          {type === 'checkbox' && <FormControlLabel control={<Checkbox checked={Boolean(value)} />} id={field} label={label} onChange={event => { void updateField(field, event.target) }} required={isRequired} />}{/* @ts-expect-error typing issue */}{/* eslint-disable-next-line react/jsx-props-no-spreading, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */}
          {type === 'select' && <Autocomplete id={field} onChange={event => { logger.info(event); void updateField(field, event.target) }} options={optionsToLabels(options)} renderInput={(parameters) => <TextField {...parameters} error={Boolean(form.isTouched) && !isValid} label={label} onChange={event => { logger.info(event); void updateField(field, event.target) }} required={isRequired} value={value} variant="standard" />} value={value} />}
        </div>
      ))}
      <div className="order-last flex flex-col md:col-span-full">
        {Boolean(errorMessage) && Boolean(form.isTouched) && <p className="text-red-500">{errorMessage}</p>}
        {onSubmit !== undefined && <Button disabled={!canSubmit} type="submit" variant="contained">Save</Button>}
      </div>
    </form>
  )
}
