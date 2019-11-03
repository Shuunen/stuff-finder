import './plugins/dom'
import './plugins/prompt'
import './plugins/storage'

import { BaseModel } from './model'
import Fuse from 'fuse.js'

class App extends BaseModel {
  constructor () {
    super('app')
    this.log('constructor')
    this.items = []
  }

  setupListeners () {
    this.on('settings-set', this.onSettingsSet)
    this.on('storage-found', this.onStorageFound)
    this.on('search-start', this.onSearchStart)
    this.on('search-retry', this.onSearchRetry)
  }

  onLoad () {
    this.emit('do-prompt', ['Stuff Finder', 1000, `Stuff Finder\n${this.coolAscii()}`])
  }

  afterLoad () {
    this.emit('settings-action-required', { required: true })
    this.emit('storage-search', 'api-credentials')
    setTimeout(() => this.emit('search-start', 'batterie'), 1000)
  }

  coolAscii () {
    return window.pickOne(['( ＾◡＾)', '♥‿♥', '八(＾□＾*)', '(◡ ‿ ◡ ✿)', '(=^ェ^=)', 'ʕ •ᴥ•ʔ', '(*°∀°)', '\\(-ㅂ-)/', 'ლ(╹◡╹ლ)', 'ლ(o◡oლ)', '＼(＾O＾)／'])
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
    let response = await this.fetchApi(credentials)
    if (!response || response.error) {
      this.emit('set-loading', false)
      this.emit('settings-action-required', { required: true, message: 'These credentials are invalid' })
      return false
    }
    let records = response.records
    let offset = response.offset
    while (offset) {
      response = await this.fetchApi(credentials, offset)
      offset = response.offset
      records = records.concat(response.records)
    }
    await this.parseApiRecords(records)
    this.emit('set-loading', false)
    this.emit('settings-action-required', { required: false, message: '' })
    return true
  }

  async fetchApi (credentials, offset) {
    let url = `https://api.airtable.com/v0/${credentials.base}/${credentials.table}?api_key=${credentials.key}&view=${credentials.view}`
    if (offset) {
      url += '&offset=' + offset
    }
    return fetch(url).then(res => res.json())
  }

  async parseApiRecords (records) {
    // this.showLog('parsing api records :', records )
    this.items = records.map(item => ({
      id: item.id,
      ...item.fields,
    }))
    this.showLog(`${this.items.length} item(s) loaded ` + this.coolAscii())
    this.log('first item is :', this.items[0])
    this.initFuse()
  }

  initFuse () {
    // https://fusejs.io/
    const options = {
      threshold: 0.45, // 0 is perfect match
      keys: ['Nom', 'Marque', 'Référence'], // TODO: this is not generic ^^"
    }
    this.fuse = new Fuse(this.items, options)
  }

  onSearchStart (stuff) {
    const results = this.fuse.search(stuff).map(r => this.getSearchResult(r))
    const title = `“${stuff}”`
    this.emit('search-complete', { title, results })
  }

  onSearchRetry () {
    this.emit('speech-recognition')
  }

  getSearchResult (data) {
    let name = `${data.Nom} ${data.Marque || ''}`.trim()
    let details = [(data.Référence || ''), (data.Boite ? `[${data.Boite}${data.Tiroir}]` : '')].join(' ').trim()
    const location = (data.Pièce && data.Pièce !== 'N/A') ? data.Pièce : ''
    if (!location) {
      name += ' ' + details
      details = ''
    }
    return { name, details, location }
  }

  onStorageFound (data) {
    if (data.key === 'api-credentials') {
      this.emit('settings-set', data.value)
    }
  }
}

// eslint-disable-next-line no-new
new App()
