import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { useState } from 'preact/hooks'
import { on, readClipboard } from 'shuutils'
import { parseClipboard } from '../utils/credentials.utils'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

// eslint-disable-next-line max-statements
export function AppSettings ({ ...properties }: { readonly [key: string]: unknown }) {
  logger.debug('AppSettings', { properties })
  const [base, setBase] = useState(state.credentials.base)
  const [isBaseValid, setBaseValidity] = useState(false)
  const [token, setToken] = useState(state.credentials.token)
  const [table, setTable] = useState(state.credentials.table)
  const [view, setView] = useState(state.credentials.view)
  const [wrap, setWrap] = useState(state.credentials.wrap)
  const [error, setError] = useState('')

  function onSubmit (event: Event) {
    event.preventDefault()
    logger.debug('onSubmit values', { base, table, token, view, wrap })
    setBaseValidity(base === '')
    setError('')
    if (base === '') setError('Base is required')
    // save to state.credentials...
  }

  // eslint-disable-next-line ssr-friendly/no-dom-globals-in-react-fc
  if (document.body.dataset.focusHandled === undefined) {
    document.body.dataset.focusHandled = 'true'
    on('focus', async () => {
      const credentials = parseClipboard(await readClipboard())
      if (credentials.base !== '') { logger.debug('no credentials found in clipboard'); return }
      logger.debug('found credentials in clipboard', { credentials })
      setBase(credentials.base)
      setToken(credentials.token)
      setTable(credentials.table)
      setView(credentials.view)
      setWrap(credentials.wrap)
    })
  }

  return (
    <div className="flex flex-col">
      <h1>Settings</h1>
      {/* @ts-expect-error typings issue */ /* eslint-disable-next-line react/forbid-component-props */}
      <Box autoComplete="off" className="mt-8 grid gap-4" component="form" noValidate onSubmit={onSubmit} spellCheck="false">
        <TextField error={isBaseValid} id="base" label="Airtable base" onChange={event => setBase(event.target.value)} required value={base} variant="standard" />
        <TextField id="token" label="Airtable token" onChange={event => setToken(event.target.value)} required value={token} variant="standard" />
        <TextField id="table" label="Airtable table" onChange={event => setTable(event.target.value)} required value={table} variant="standard" />
        <TextField id="view" label="Airtable view" onChange={event => setView(event.target.value)} required value={view} variant="standard" />
        <TextField id="wrap" label="Wrap Api key (optional)" onChange={event => setWrap(event.target.value)} value={wrap} variant="standard" />
        <p className="text-red-500">{error}</p>
        <div className="flex justify-between">
          <Button type="submit" variant="contained">Save</Button>
        </div>
      </Box>
    </div>
  )
}
