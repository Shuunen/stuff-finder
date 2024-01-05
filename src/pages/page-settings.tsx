import TuneIcon from '@mui/icons-material/Tune'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { useSignalEffect } from '@preact/signals'
import { useState } from 'preact/hooks'
import { off, on, readClipboard } from 'shuutils'
import { AppPageCard } from '../components/app-page-card'
import { parseClipboard } from '../utils/credentials.utils'
import { validateForm } from '../utils/forms.utils'
import { logger } from '../utils/logger.utils'
import { settingsForm } from '../utils/settings.utils'
import { state } from '../utils/state.utils'

export function PageSettings ({ ...properties }: { readonly [key: string]: unknown }) {
  logger.debug('PageSettings', { properties })
  const [form, setForm] = useState(settingsForm)

  const { hasChanged, updatedForm } = validateForm(form)
  if (hasChanged) setForm(updatedForm)

  function onSubmit (event: Event) {
    event.preventDefault()
    logger.debug('onSubmit', { form })
    state.credentials = {
      base: form.fields.base?.value ?? state.credentials.base,
      table: form.fields.table?.value ?? state.credentials.table,
      token: form.fields.token?.value ?? state.credentials.token,
      view: form.fields.view?.value ?? state.credentials.view,
      wrap: form.fields.wrap?.value ?? state.credentials.wrap,
    }
    logger.showLog('credentials saved, reloading...', { credentials: state.credentials })
    document.location.reload()
  }

  function updateField (field: string, value: string) {
    logger.debug('updateField', { field, value })
    const actualField = form.fields[field]
    if (actualField === undefined) throw new Error(`field "${field}" not found in form`)
    setForm({ ...form, fields: { ...form.fields, [field]: { ...actualField, value } }, isTouched: true })
  }

  async function checkCredentialsInClipboard () { // eslint-disable-line max-statements
    logger.debug('checkCredentialsInClipboard')
    const credentials = parseClipboard(await readClipboard())
    if (credentials.base === '') { logger.debug('no credentials found in clipboard'); return }
    logger.showLog('found credentials in clipboard', { credentials })
    updateField('base', credentials.base)
    updateField('table', credentials.table)
    updateField('token', credentials.token)
    updateField('view', credentials.view)
    updateField('wrap', credentials.wrap)
  }

  useSignalEffect(() => {
    const handler = on('focus', () => { void checkCredentialsInClipboard() }, window)
    void checkCredentialsInClipboard()
    return () => { if (handler !== false) off(handler) }
  })

  return (
    <AppPageCard cardTitle="Settings" icon={TuneIcon} pageCode="settings" pageTitle="Settings">
      <div className="flex flex-col">
        <p>Stuff-Finder need credentials to access your Airtable base, data will be saved in your browser local storage.</p>
        <form autoComplete="off" className="grid w-full gap-6 md:grid-cols-2" noValidate onSubmit={onSubmit} spellCheck={false}>
          {Object.entries(form.fields).map(([field, { isRequired, isValid, label, value }]) => (
            <TextField error={!isValid} id={field} key={field} label={label} onChange={event => updateField(field, event.target.value)} required={isRequired} value={value} variant="standard" />
          ))}
          <div />
          <div className="flex flex-col md:col-span-2">
            {Boolean(form.errorMessage) && <p className="text-red-500">{form.errorMessage}</p>}
            <Button disabled={!form.isValid || !form.isTouched} type="submit" variant="contained">Save</Button>
          </div>
        </form>
      </div>
    </AppPageCard>
  )
}
