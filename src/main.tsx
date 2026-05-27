import { createRoot } from 'react-dom/client'
import { toastError, toastInfo } from 'shuutils'
import { App } from './app'
import './assets/styles.css'
import { getItems } from './utils/item.utils'
import { logger } from './utils/logger.utils'
import { state } from './utils/state.utils'

logger.info('app start')

const root = document.querySelector('#app')
if (root) createRoot(root).render(<App />)
else logger.error('root not found')

const result = await getItems()
state.status = result.ok ? 'ready' : 'settings-required'
if (result.ok) toastInfo(result.value)
else if (result.error instanceof Error) toastError(result.error.message)
else if (typeof result.error === 'string') toastError(result.error)
