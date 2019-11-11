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
    this.on('app-form--settings--set', this.onSettingsSave)
    this.on('app-form--settings--save', this.onSettingsSave)
    this.on('storage-found', this.onStorageFound)
    this.on('search-start', this.onSearchStart)
    this.on('search-retry', this.onSearchRetry)
    this.on('fade-in', this.fadeIn)
    this.on('fade-out', el => this.fadeOut(el))
    this.on('fade-out-destroy', el => this.fadeOut(el, true))
    setTimeout(() => {
      this.settingsTriggerEl = document.querySelector('.app-settings--trigger')
      this.settingsActionRequired(true)
      this.emit('storage-search', 'api-credentials')
      this.showTitle()
    }, 300)
  }

  coolAscii () {
    return window.pickOne(['( ＾◡＾)', '♥‿♥', '八(＾□＾*)', '(◡ ‿ ◡ ✿)', '(=^ェ^=)', 'ʕ •ᴥ•ʔ', '(*°∀°)', '\\(-ㅂ-)/', 'ლ(╹◡╹ლ)', 'ლ(o◡oლ)', '＼(＾O＾)／'])
  }

  showTitle () {
    this.emit('do-prompt', ['Stuff Finder', 1000, `Stuff Finder\n${this.coolAscii()}`])
  }

  async onSettingsSave (settings) {
    this.log('trying settings', settings)
    const itemsLoaded = await this.loadItems(settings)
    if (!itemsLoaded) {
      return this.settingsActionRequired(true, 'failed to use api settings')
    }
    this.settingsActionRequired(false)
    this.emit('storage-set', { key: 'api-settings', value: settings })
  }

  settingsActionRequired (actionRequired, errorMessage = '') {
    this.log('set action required to', actionRequired)
    this.settingsTriggerEl.classList.toggle('action-required', actionRequired)
    this.emit('app-form--settings--error', errorMessage)
    if (!actionRequired) {
      this.emit('app-modal--close')
    }
  }

  async loadItems (settings) {
    this.emit('set-loading', true)
    let response = await this.fetchApi(settings)
    if (!response || response.error) {
      this.emit('set-loading', false)
      return false
    }
    let records = response.records
    let offset = response.offset
    while (offset) {
      response = await this.fetchApi(settings, offset)
      offset = response.offset
      records = records.concat(response.records)
    }
    await this.parseApiRecords(records)
    this.emit('set-loading', false)
    return true
  }

  async fetchApi (settings, offset) {
    let url = `https://api.airtable.com/v0/${settings.base}/${settings.table}?api_key=${settings.key}&view=${settings.view}`
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
      keys: [{
        name: 'Nom',
        weight: 0.5,
      }, {
        name: 'Marque',
        weight: 0.3,
      }, {
        name: 'Référence',
        weight: 0.8,
      }, {
        name: 'Catégorie',
        weight: 0.2,
      }], // TODO: this is not generic ^^"
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
    let details = [(data.Référence || ''), (data.Boite ? `[${data.Boite}${data.Tiroir || ''}]` : '')].join(' ').trim()
    const location = (data.Pièce && data.Pièce !== 'N/A') ? data.Pièce : ''
    if (!location) {
      name += ' ' + details
      details = ''
    }
    return { ...data, name, details, location }
  }

  onStorageFound (data) {
    if (data.key === 'api-credentials') {
      this.emit('app-form--settings--set', data.value)
    }
  }

  async fadeIn (el) {
    this.log('fadeIn')
    if (!el.classList.contains('hide')) {
      this.warn('please add "hide" class before mounting dom element and then call fade-in')
      return
    }
    await this.sleep(10)
    el.style.opacity = 1
  }

  async fadeOut (el, destroy = false) {
    this.log('fadeOut')
    el.classList.add('hide')
    await this.sleep(350)
    el.classList.remove('hide')
    el.classList.add('hidden')
    if (!destroy) {
      return
    }
    await this.sleep(350)
    el.remove()
  }

  async sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, (ms || 1000)))
  }
}

// eslint-disable-next-line no-new
new App()
