/* eslint-disable jsdoc/require-jsdoc */
import type { AppCredentials } from './constants'
import { airtableRecordToItem, getAllItems, isLocalAndRemoteSync } from './utils/airtable.utils'
import { getCommonListsFromItems } from './utils/item.utils'
import { logger } from './utils/logger.utils'
import { state } from './utils/state.utils'
import { coolAscii } from './utils/strings.utils'

// eslint-disable-next-line no-restricted-syntax
class App {

  public constructor () {
    logger.info('app start')
    this.checkExistingSettings()
  }

  private checkExistingSettings () {
    logger.info('checkExistingSettings', { credentials: state.credentials })
    if (!state.credentials.base) { this.settingsActionRequired(true); return }
    void this.onSettingsSave(state.credentials)
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  private isLoading (isActive: boolean, reason: string) {
    logger.info('isLoading active ?', isActive, 'reason ?', reason)
    state.status = isActive ? 'loading' : 'ready'
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
    if (isLocalAndRemoteSync(records)) {
      logger.showLog('no updates from airtable, cache seems up to date')
      return true
    }
    while ((offset?.length ?? 0) > 0) {
      result = await getAllItems(offset) // eslint-disable-line no-await-in-loop
      offset = result.offset // eslint-disable-line unicorn/consistent-destructuring
      records = [...records, ...result.records] // eslint-disable-line unicorn/consistent-destructuring
    }
    // eslint-disable-next-line require-atomic-updates
    state.items = records.map((element) => airtableRecordToItem(element))
    state.lists = getCommonListsFromItems(state.items)
    logger.showLog(`${state.items.length} item(s) freshly loaded ${coolAscii()}`)
    return true
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

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  private settingsActionRequired (isActionRequired: boolean, errorMessage = '') {
    logger.info('settingsActionRequired', { errorMessage, isActionRequired })
    state.status = isActionRequired ? 'settings-required' : 'ready'
  }
}

// eslint-disable-next-line no-new
new App()
