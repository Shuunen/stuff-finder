import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { useState } from 'preact/hooks'
import { on, readClipboard } from 'shuutils'
import { parseClipboard } from '../utils/credentials.utils'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

export function AppSettings ({ ...properties }: { readonly [key: string]: unknown }) {
  logger.debug('AppSettings', { properties })
  const [base, setBase] = useState(state.credentials.base)
  const [baseError, setBaseError] = useState(false)
  const [token, setToken] = useState(state.credentials.token)
  const [table, setTable] = useState(state.credentials.table)
  const [view, setView] = useState(state.credentials.view)
  const [wrap, setWrap] = useState(state.credentials.wrap)
  const [error, setError] = useState('')

  function onSubmit (event: Event) {
    event.preventDefault()
    logger.debug('onSubmit values', { base, token, table, view, wrap })
    setError('')
    setBaseError(base === '')
    if (base === '') return setError('Base is required')
    // state.credentials = data
  }

  if (document.body.dataset.focusHandled === undefined) {
    document.body.dataset.focusHandled = 'true'
    on('focus', async () => {
      logger.debug('on focus')
      const clipboard = await readClipboard()
      const credentials = parseClipboard(clipboard)
      logger.debug('clipboard read', { clipboard })
      if (credentials.base === '') return logger.debug('but no credentials found')
      logger.debug('found credentials', { credentials })
      setBase(credentials.base)
      setToken(credentials.token)
      setTable(credentials.table)
      setView(credentials.view)
      setWrap(credentials.wrap)
    })
  }

  return (
    <div class="flex flex-col">
      <h1>Settings</h1>
      {/* @ts-expect-error typings issue */}
      <Box component="form" className="grid gap-4 mt-8" noValidate spellCheck="false" autoComplete="off" onSubmit={onSubmit}>
        <TextField required id="base" label="Airtable base" variant="standard" value={base} onChange={e => setBase(e.target.value)} error={baseError} />
        <TextField required id="token" label="Airtable token" variant="standard" value={token} onChange={e => setToken(e.target.value)} />
        <TextField required id="table" label="Airtable table" variant="standard" value={table} onChange={e => setTable(e.target.value)} />
        <TextField required id="view" label="Airtable view" variant="standard" value={view} onChange={e => setView(e.target.value)} />
        <TextField id="wrap" label="Wrap Api key (optional)" variant="standard" value={wrap} onChange={e => setWrap(e.target.value)} />
        <p className="text-red-500">{error}</p>
        <div className="flex justify-between">
          <Button variant="contained" type="submit">Save</Button>
        </div>
      </Box>
    </div>
  )
}
