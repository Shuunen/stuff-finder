import { clone } from 'shuutils'
import { ItemField, type Item, type ItemPhoto } from './types/item.types'
import type { AirtableMultipleRecordResponse, AirtableSingleRecordResponse } from './types/requests.types'
import type { AppCredentials } from './types/settings.types'
import { get, patch, post } from './utils/browser.utils'
import { airtableRecordToItem } from './utils/item.utils'
import { logger } from './utils/logger.utils'
import { state } from './utils/state.utils'
import { coolAscii } from './utils/strings.utils'

class App {

  private apiUrl = ''

  public constructor () {
    logger.info('app start')
    this.checkExistingSettings()
    // eslint-disable-next-line @typescript-eslint/unbound-method
    logger.debug(this.getItemFieldsToPush, this.pushItemLocally, this.pushItemRemotely)
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

  // eslint-disable-next-line max-statements, complexity, sonarjs/cognitive-complexity
  private getItemFieldsToPush (data: Partial<Item>) {
    const fields: AirtableSingleRecordResponse['fields'] = {}
    if (data.barcode !== undefined && data.barcode.length > 0) fields.barcode = data.barcode
    if (data.box !== undefined && data.box.length > 0) fields.box = data.box
    if (data.brand !== undefined && data.brand.length > 0) fields.brand = data.brand
    if (data.category !== undefined && data.category.length > 0) fields.category = data.category
    if (data.details !== undefined && data.details.length > 0) fields.details = data.details
    if (data.drawer !== undefined && data.drawer.length > 0) fields.drawer = data.drawer
    if (data.location !== undefined && data.location.length > 0) fields.location = data.location
    if (data.name !== undefined && data.name.length > 0) fields.name = data.name
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    if (data.photo !== undefined) fields.photo = [{ url: data.photo } as unknown as ItemPhoto] // we don't need the whole object
    if (data.price !== undefined) fields.price = data.price
    if (data.reference !== undefined && data.reference.length > 0) fields.reference = data.reference
    if (data.status !== undefined && data.status.length > 0) fields.status = data.status
    fields[ItemField.ReferencePrinted] = data[ItemField.ReferencePrinted] ?? false
    logger.info('fields before clean', clone(fields))
    if (data.id !== undefined && data.id.length > 0) {
      const existing = state.items.find(existingItem => existingItem.id === data.id)
      if (!existing) throw new Error('existing item not found locally')
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const dataFields = Object.keys(fields) as ItemField[]
      dataFields.forEach((field) => {
        if (field === ItemField.Id) return
        const hasSamePhoto = (field === ItemField.Photo && existing.photo && existing.photo[0]?.url === fields.photo?.[0]?.url) ?? false
        const hasSameValue = existing[field] === fields[field]
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        if (hasSamePhoto || hasSameValue) delete fields[field]
      })
      logger.info('fields after clean', clone(fields))
    }
    return fields
  }

  private pushItemLocally (itemTouched: Item) {
    logger.info('pushing item locally', itemTouched)
    const index = state.items.findIndex(item => item.id === itemTouched.id)
    if (index >= 0) state.items[index] = itemTouched // update existing item
    else if (itemTouched.id) state.items.push(itemTouched) // new item with id
    else logger.showError('cannot add item without id')
  }

  private settingsActionRequired (isActionRequired: boolean, errorMessage = '') {
    logger.info('settingsActionRequired', { errorMessage, isActionRequired })
    state.status = isActionRequired ? 'settings-required' : 'ready'
  }

  private async onSettingsSave (settings: AppCredentials) {
    this.apiUrl = `https://api.airtable.com/v0/${settings.base}/${settings.table}?view=${settings.view}`
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
    let response = await this.fetchApi()
    if (response.error) {
      this.isLoading(false, 'loadItems failed to fetch api')
      logger.showError(`airtable fetch failed with error : ${response.error.message}`)
      return false
    }
    let { offset, records } = response
    if (!records[0] || records.length === 0) {
      this.isLoading(false, 'loadItems failed to fetch api')
      logger.showError('airtable fetch returned no records')
      return false
    }
    const remote = airtableRecordToItem(records[0])
    if (state.items.some(item => item.id === remote.id && item[ItemField.UpdatedOn] === remote[ItemField.UpdatedOn])) {
      logger.showLog('no updates from airtable, cache seems up to date')
      return true
    }
    while ((offset?.length ?? 0) > 0) {
      response = await this.fetchApi(offset) // eslint-disable-line no-await-in-loop
      offset = response.offset // eslint-disable-line unicorn/consistent-destructuring
      records = [...records, ...response.records] // eslint-disable-line unicorn/consistent-destructuring
    }
    this.parseApiRecords(records)
    return true
  }

  private async fetchApi (offset?: string) {
    const sortByUpdatedFirst = '&sort%5B0%5D%5Bfield%5D=updated-on&sort%5B0%5D%5Bdirection%5D=desc'
    const url = this.apiUrl + (offset === undefined ? '' : `&offset=${offset}`) + sortByUpdatedFirst
    if (!url.startsWith('https://api.airtable.com/v0/')) throw new Error('invalid api url')
    return await get<AirtableMultipleRecordResponse>(url, false)
  }

  private async pushItemRemotely (fields: AirtableSingleRecordResponse['fields'], id?: Item['id']) {
    if (id === undefined) throw new Error('cannot push item remotely without id')
    const data = { fields }
    if (id === '') return await post<AirtableSingleRecordResponse>(this.apiUrl, data)
    const url = this.apiUrl.replace('?', `/${id}?`)
    return await patch<AirtableSingleRecordResponse>(url, data)
  }

}

// eslint-disable-next-line no-new
new App()
