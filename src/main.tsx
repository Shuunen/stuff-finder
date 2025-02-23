import { render } from 'preact'
import { toastError, toastInfo } from 'shuutils'
import { App } from './app.tsx'
import './assets/styles.css'
import { getItems } from './utils/item.utils.ts'
import { logger } from './utils/logger.utils.ts'
import { state } from './utils/state.utils.ts'

logger.info('app start')

const root = document.querySelector('#app')
if (root) render(<App />, root)
else logger.error('root not found')

// eslint-disable-next-line unicorn/prefer-top-level-await
void getItems().then(result => {
  state.status = result.ok ? 'ready' : 'settings-required'
  if (result.ok) toastInfo(result.value)
  else if (typeof result.error === 'string') toastError(result.error)
})
