import TuneIcon from '@mui/icons-material/Tune'
import { useCallback } from 'preact/hooks'
import { AppForm } from '../components/app-form'
import { AppPageCard } from '../components/app-page-card'
import { logger } from '../utils/logger.utils'
import { settingsForm } from '../utils/settings.utils'
import { state } from '../utils/state.utils'

export function PageSettings ({ ...properties }: Readonly<Record<string, unknown>>) {
  logger.debug('PageSettings', { properties })
  type Form = typeof settingsForm
  const onSubmit = useCallback((form: Form) => {
    logger.debug('onSubmit', { form })
    state.credentials = { base: form.fields.base.value, table: form.fields.table.value, token: form.fields.token.value, view: form.fields.view.value, wrap: form.fields.wrap.value }
    logger.showLog('credentials saved, reloading...', { credentials: state.credentials })
    document.location.reload()
  }, [])

  return (
    <AppPageCard cardTitle="Settings" icon={TuneIcon} pageCode="settings" pageTitle="Settings">
      <div className="flex flex-col">
        <p>Stuff-Finder need credentials to access your Airtable base, data will be saved in your browser local storage.</p>
        <AppForm initialForm={settingsForm} onSubmit={onSubmit} />
      </div>
    </AppPageCard>
  )
}
