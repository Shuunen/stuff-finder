
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { useSignalEffect } from '@preact/signals'
import { useState } from 'preact/hooks'
import { debounce, off, on, parseJson, readClipboard } from 'shuutils'
import { delays, voidFunction } from '../constants'
import { validateForm, type Form } from '../utils/forms.utils'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

// eslint-disable-next-line max-statements
export function AppForm<FormType extends Form> ({ initialForm, onChange = voidFunction, onSubmit }: { readonly initialForm: FormType; readonly onChange?: (form: FormType) => void; readonly onSubmit: (form: FormType) => void }) {

  const [form, setForm] = useState(initialForm)

  const { hasChanged, updatedForm } = validateForm(form)
  if (hasChanged) setForm(updatedForm)

  function onFormSubmit (event: Event) {
    event.preventDefault()
    onSubmit(form)
  }

  function updateFieldSync (field: string, value: string, isFromClipboard = false) {
    logger.debug('updateField', { field, value })
    const actualField = form.fields[field]
    if (actualField === undefined) throw new Error(`field "${field}" not found in form`)
    if (isFromClipboard) state.message = { content: `Pasted "${field}" field value`, delay: delays.second, type: 'success' }
    setForm({ ...form, fields: { ...form.fields, [field]: { ...actualField, value } }, isTouched: true })
  }

  const updateField = debounce(updateFieldSync, delays.large)

  async function checkDataInClipboard () {
    logger.debug('checkDataInClipboard')
    const { error, value: data } = parseJson(await readClipboard())
    if (error !== '' || typeof data !== 'object' || data === null) { logger.debug('error or data not an object', { data, error }); return }
    logger.debug('found object', { data })
    Object.entries(data).forEach(([key, value]) => {
      if (typeof key !== 'string' || typeof value !== 'string' || key === '' || value === '') return
      if (form.fields[key] !== undefined) void updateField(key, value, true)
    })
  }

  useSignalEffect(() => {
    const handler = on('focus', () => { void checkDataInClipboard() }, window)
    void checkDataInClipboard()
    return () => { if (handler !== false) off(handler) }
  })

  return (
    <form autoComplete="off" className={`grid w-full ${form.columns === 3 ? 'gap-3 md:grid-cols-3' : 'gap-6 md:grid-cols-2'}`} noValidate onSubmit={onFormSubmit} spellCheck={false}>{/* eslint-disable-line @typescript-eslint/no-magic-numbers */}
      {Object.entries(form.fields).map(([field, { isRequired, isValid, label, order, value }]) => (
        <div className="grid w-full" key={field} style={{ order }}>
          <TextField error={!isValid} id={field} label={label} onChange={event => { void updateField(field, event.target.value) }} required={isRequired} value={value} variant="standard" />
        </div>
      ))}
      <div className="order-last flex flex-col md:col-span-full">
        {Boolean(form.errorMessage) && Boolean(form.isTouched) && <p className="text-red-500">{form.errorMessage}</p>}
        <Button disabled={!form.isValid || !form.isTouched} type="submit" variant="contained">Save</Button>
      </div>
    </form>
  )
}
