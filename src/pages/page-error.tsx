import PestControlIcon from '@mui/icons-material/PestControl'
import { AppPageBottom } from '../components/app-page-bottom'
import { setTitle } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'

export function PageError ({ code, ...properties }: { readonly code: string; readonly [key: string]: unknown }) {
  logger.debug('PageError', { code, properties })
  setTitle(`Error ${code}`)
  return (
    <div className="flex h-screen flex-col" data-page="error">
      <h1>Ow no :(</h1>
      <h2>Error {code}</h2>
      <AppPageBottom icon={PestControlIcon} />
    </div>
  )
}
