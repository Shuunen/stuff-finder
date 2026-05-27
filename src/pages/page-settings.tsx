import TuneIcon from '@mui/icons-material/Tune'
import { Button } from '@mui/material'
import { useCallback } from 'react'
import { safeParse } from 'valibot'
import { AppForm } from '../components/app-form'
import { AppPageCard } from '../components/app-page-card'
import { downloadItems } from '../utils/database.utils'
import { logger } from '../utils/logger.utils'
import { settingsForm } from '../utils/settings.utils'
import { state } from '../utils/state.utils'
import { settingsSchema, type SettingsFormData } from './page-settings.schemas'

export function PageSettings() {
  const onSubmit = useCallback((form: typeof settingsForm) => {
    const formData: SettingsFormData = {
      bucketId: form.fields.bucketId.value,
      collectionId: form.fields.collectionId.value,
      databaseId: form.fields.databaseId.value,
    }
    const parsed = safeParse(settingsSchema, formData)
    if (!parsed.success) {
      logger.error('settings validation failed', parsed.issues)
      return
    }
    state.credentials = {
      bucketId: parsed.output.bucketId,
      collectionId: parsed.output.collectionId,
      databaseId: parsed.output.databaseId,
      wrap: '',
    }
    logger.showSuccess('credentials saved...')
    document.location.reload()
  }, [])

  return (
    <AppPageCard cardTitle="Settings" icon={TuneIcon} pageCode="settings" pageTitle="Settings">
      <div className="flex flex-col">
        <p>Stuff-Finder needs your Appwrite credentials to access your data, they are only stored in your browser.</p>
        <AppForm initialForm={settingsForm} onSubmit={onSubmit} />
      </div>
      <Button className="absolute bottom-6" name="download" onClick={downloadItems} type="button" variant="outlined">
        Download items
      </Button>
    </AppPageCard>
  )
}
