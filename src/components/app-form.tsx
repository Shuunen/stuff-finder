
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import { useSignalEffect } from '@preact/signals'
import { useState } from 'preact/hooks'
import { debounce, off, on, parseJson, readClipboard } from 'shuutils'
import { delays, voidFunction } from '../constants'
import { validateForm, type Form } from '../utils/forms.utils'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

type Properties<FormType extends Form> = { readonly error?: string; readonly initialForm: FormType; readonly onChange?: (form: FormType) => void; readonly onSubmit?: ((form: FormType) => void) | undefined }

// eslint-disable-next-line max-statements, unicorn/no-useless-undefined
export function AppForm<FormType extends Form> ({ error: parentError = '', initialForm, onChange = voidFunction, onSubmit = undefined }: Properties<FormType>) {

  const [form, setForm] = useState(initialForm)

  const { hasChanged, updatedForm } = validateForm(form)
  if (hasChanged) { onChange(updatedForm); setForm(updatedForm) }

  function onFormSubmit (event: Event) {
    event.preventDefault()
    onSubmit?.(form)
  }

  function updateFieldSync (field: string, target: EventTarget, isFromClipboard = false) {
    const input = target as HTMLInputElement // eslint-disable-line @typescript-eslint/consistent-type-assertions
    const value = input.type === 'checkbox' ? input.checked : input.value
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
      if (actualField === undefined) return
      // @ts-expect-error typing issue
      futureForm.fields[key] = { ...actualField, value }
    })
    setForm(futureForm)
  }

  useSignalEffect(() => {
    const handler = on('focus', () => { void checkDataInClipboard() }, window)
    void checkDataInClipboard()
    return () => { if (handler !== false) off(handler) }
  })

  const fields = Object.entries(form.fields).sort(([, { order: orderA }], [, { order: orderB }]) => orderA - orderB)
  const errorMessage = parentError.length > 0 ? parentError : form.errorMessage
  const canSubmit = form.isValid && form.isTouched && errorMessage.length === 0

  return (
    <form autoComplete="off" className={`grid w-full gap-6 ${form.columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`} noValidate onSubmit={onFormSubmit} spellCheck={false}>{/* eslint-disable-line @typescript-eslint/no-magic-numbers */}
      {fields.map(([field, { isRequired, isValid, label, options, type, unit, value }]) => (
        <div className="grid w-full" key={field}>{/* @ts-expect-error typing issue */}
          {type === 'text' && <TextField error={Boolean(form.isTouched) && !isValid} id={field} InputProps={{ endAdornment: unit.length > 0 && <InputAdornment position="end">{unit}</InputAdornment> }} label={label} onChange={event => { void updateField(field, event.target) }} required={isRequired} value={value} variant="standard" />}
          {type === 'checkbox' && <FormControlLabel control={<Checkbox />} id={field} label={label} onChange={event => { void updateField(field, event.target) }} required={isRequired} value={value} />}{/* @ts-expect-error typing issue */}
          {type === 'select' && <FormControl fullWidth variant="standard">
            <InputLabel id={field}>{label}</InputLabel>
            <Select label={label} labelId={field} onChange={event => { void updateField(field, event.target) }} value={value}>{/* @ts-expect-error typing issue */}
              {options.map(({ label: optionLabel, value: optionValue }) => <MenuItem key={optionValue} value={optionValue}>{optionLabel}</MenuItem>)}
            </Select>
          </FormControl>}
        </div>
      ))}
      <div className="order-last flex flex-col md:col-span-full">
        {Boolean(errorMessage) && Boolean(form.isTouched) && <p className="text-red-500">{errorMessage}</p>}
        {onSubmit !== undefined && <Button disabled={!canSubmit} type="submit" variant="contained">Save</Button>}
      </div>
    </form>
  )
}
