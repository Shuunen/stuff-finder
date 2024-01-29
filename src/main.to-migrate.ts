import type { AppCredentials } from './types/settings.types'
import { airtableRecordToItem, getAllItems } from './utils/item.utils'
import { logger } from './utils/logger.utils'
import type { AirtableSingleRecordResponse } from './utils/parsers.utils'
import { state } from './utils/state.utils'
import { coolAscii } from './utils/strings.utils'

class App {

  public constructor () {
    logger.info('app start')
    this.checkExistingSettings()
  }

  private checkExistingSettings () {
    if (!state.credentials.base) { this.settingsActionRequired(true); return }
    void this.onSettingsSave(state.credentials)
  }

  private isLoading (isActive: boolean, reason: string) {
    logger.info('isLoading active ?', isActive, 'reason ?', reason)
    state.status = isActive ? 'loading' : 'ready'
  }

  private parseApiRecords (records: AirtableSingleRecordResponse[]) {
    state.items = records.map(record => airtableRecordToItem(record))
    logger.showLog(`${state.items.length} item(s) loaded ${coolAscii()}`)
  }

  private settingsActionRequired (isActionRequired: boolean, errorMessage = '') {
    logger.info('settingsActionRequired', { errorMessage, isActionRequired })
    state.status = isActionRequired ? 'settings-required' : 'ready'
  }

  private async onSettingsSave (settings: AppCredentials) {
    state.credentials = settings
    const areItemsLoaded = await this.loadItems()
    if (!areItemsLoaded) {
      this.settingsActionRequired(true, 'failed to use api settings')
      return
    }
    this.settingsActionRequired(false)
  }

  // eslint-disable-next-line max-statements
  private async loadItems () {
    this.isLoading(true, 'loadItems starts')
    logger.showLog(`using ${state.items.length} cached items`)
    let result = await getAllItems()
    let { offset, records } = result
    if (!records[0] || records.length === 0) {
      this.isLoading(false, 'loadItems failed to fetch api')
      logger.showError('airtable fetch returned no records')
      return false
    }
    const remote = airtableRecordToItem(records[0])
    if (state.items.some(item => item.id === remote.id && item['updated-on'] === remote['updated-on'])) {
      logger.showLog('no updates from airtable, cache seems up to date')
      return true
    }
    while ((offset?.length ?? 0) > 0) {
      result = await getAllItems(offset) // eslint-disable-line no-await-in-loop
      offset = result.offset // eslint-disable-line unicorn/consistent-destructuring
      records = [...records, ...result.records] // eslint-disable-line unicorn/consistent-destructuring
    }
    this.parseApiRecords(records)
    return true
  }
}

// eslint-disable-next-line no-new
new App()
