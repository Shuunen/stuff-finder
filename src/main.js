import './plugins/dom'
import './plugins/prompt'
import './plugins/speech'
import './plugins/storage'

import { BaseModel } from './model'

class App extends BaseModel {
  constructor () {
    super('app')
    this.log('constructor')
    this.items = []
  }

  setupListeners () {
    this.on('settings-set', this.onSettingsSet)
    this.on('storage-found', this.onStorageFound)
  }

  afterLoad () {
    this.emit('settings-action-required', { required: true })
    this.emit('storage-search', 'api-credentials')
  }

  onSettingsSet (settings) {
    const { base, key, table, view } = settings
    if (base && key && table && view) {
      const credentials = { base, key, table, view }
      this.tryCredentials(credentials)
    } else {
      this.emit('settings-action-required', { required: true })
    }
  }

  async tryCredentials (credentials) {
    this.log('trying credentials', credentials)
    const itemsLoaded = await this.loadItems(credentials)
    if (!itemsLoaded) {
      return this.error('failed to use api credentials', credentials)
    }
    this.emit('storage-set', { key: 'api-credentials', value: credentials })
  }

  async loadItems (credentials) {
    this.emit('set-loading', true)
    const response = await fetch(`https://api.airtable.com/v0/${credentials.base}/${credentials.table}?api_key=${credentials.key}&view=${credentials.view}`).then(res => res.json())
    if (!response || response.error) {
      this.emit('set-loading', false)
      this.emit('settings-action-required', { required: true, message: 'These credentials are invalid' })
      return false
    }
    await this.parseApiResponse(response)
    this.emit('set-loading', false)
    this.emit('settings-action-required', { required: false, message: '' })
    return true
  }

  async parseApiResponse (response) {
    this.showLog('parsing api response...', response)
    if (!response.records) {
      throw Error('api does not return the expected format')
    }
    this.items = response.records.map(item => ({
      id: item.id,
      ...item.fields,
    }))
    this.showLog(`${this.items.length} item(s) loaded \\o/`)
    this.log('first item is :', this.items[0])
  }

  onStorageFound (data) {
    this.emit('settings-set', data.value)
  }
}

// eslint-disable-next-line no-new
new App()
