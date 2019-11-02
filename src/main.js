import './plugins/dom'
import './plugins/prompt'
import './plugins/speech'
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
    this.on('search-intent', this.onSearchIntent)
    this.on('search-retry', this.onSearchRetry)
  }

  onLoad () {
    this.emit('do-prompt', ['Stuff Finder', 1000, `Stuff Finder ${this.coolAscii()}`])
  }

  afterLoad () {
    this.emit('settings-action-required', { required: true })
    this.emit('storage-search', 'api-credentials')
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
    // this.showLog('parsing api response...', response)
    if (!response.records) {
      throw Error('api does not return the expected format')
    }
    this.items = response.records.map(item => ({
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

  search (stuff, intent) {
    const results = this.fuse.search(stuff).map(r => this.getSearchResult(r))
    const title = this.getSearchTitle(intent, stuff)
    this.emit('search-complete', { title, results })
  }

  onSearchIntent (data) {
    this.lastIntent = data.intent
    this.search(data.stuff, data.intent)
  }

  onSearchRetry () {
    this.emit('speech-recognition', this.lastIntent)
  }

  getSearchResult (data) {
    const name = data.Nom
    const location = (data.Pièce && data.Pièce !== 'N/A') ? data.Pièce : 'unknown location'
    return { name, location }
  }

  getSearchTitle (intent, stuff = '') {
    switch (intent) {
      case 'looking-for':
      case 'want-to-store':
        return `Results for "${stuff}"`
      default:
        return 'unknown intent'
    }
  }

  onStorageFound (data) {
    if (data.key === 'api-credentials') {
      this.emit('settings-set', data.value)
    }
  }
}

// eslint-disable-next-line no-new
new App()
