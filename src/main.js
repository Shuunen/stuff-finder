/* global CustomEvent, fetch */
import Fuse from 'fuse.js'
import { pickOne } from 'shuutils'
import './components'
import './services'

class App {
  constructor () {
    this.items = []
    window.emit = (...args) => this.emit.apply(this, args)
    this.on('app-form--settings--set', this.onSettingsSave)
    this.on('app-form--settings--save', this.onSettingsSave)
    this.on('app-speech--recognition-success', this.onSearchStart)
    this.on('app-update--item', this.onUpdateItem)
    this.on('storage-found', this.onStorageFound)
    this.on('get-barcodes-to-print', this.getBarcodesToPrint)
    this.on('search-start', this.onSearchStart)
    this.on('search-retry', this.onSearchRetry)
    this.on('fade-in', this.fadeIn)
    this.on('fade-out', el => this.fadeOut(el))
    this.on('fade-out-destroy', el => this.fadeOut(el, true))
    setTimeout(() => {
      this.settingsActionRequired(true)
      this.emit('storage-search', 'app-settings')
      this.showTitle()
    }, 300)
    // setTimeout(() => this.onSearchStart('batter'), 2000)
  }

  emit (eventName, eventData) {
    console.log(`emit event "${eventName}"`, eventData === undefined ? '' : eventData)
    window.dispatchEvent(new CustomEvent(eventName, { detail: eventData }))
  }

  on (eventName, callback) {
    window.addEventListener(eventName, event => callback.bind(this)(event.detail))
  }

  coolAscii () {
    return pickOne(['( ＾◡＾)', '♥‿♥', '八(＾□＾*)', '(◡ ‿ ◡ ✿)', '(=^ェ^=)', 'ʕ •ᴥ•ʔ', '(*°∀°)', '\\(-ㅂ-)/', 'ლ(╹◡╹ლ)', 'ლ(o◡oლ)', '＼(＾O＾)／'])
  }

  showTitle () {
    this.emit('app-prompter--type', ['Stuff Finder', 1000, `Stuff Finder\n${this.coolAscii()}`])
  }

  async onSettingsSave (settings) {
    const itemsLoaded = await this.loadItems(settings)
    if (!itemsLoaded) {
      return this.settingsActionRequired(true, 'failed to use api settings')
    }
    this.settingsActionRequired(false)
    this.emit('storage-set', { key: 'app-settings', value: settings })
  }

  settingsActionRequired (actionRequired, errorMessage = '') {
    this.emit('app-settings-trigger--animate', actionRequired)
    this.emit('app-form--settings--error', errorMessage)
    if (!actionRequired) {
      this.emit('app-modal--close')
    }
  }

  isLoading (active) {
    this.emit('app-loader--toggle', active)
  }

  async loadItems (settings) {
    this.isLoading(true)
    let response = await this.fetchApi(settings)
    if (!response || response.error) {
      this.isLoading(false)
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
    this.isLoading(false)
    return true
  }

  async getBarcodesToPrint () {
    const barcodes = this.items.filter(i => i['ref-printed'] === false)
    this.emit('barcodes-to-print', barcodes)
  }

  async fetchApi (settings, offset) {
    let url = this.apiUrl = `https://api.airtable.com/v0/${settings.base}/${settings.table}?api_key=${settings.key}&view=${settings.view}`
    if (offset) {
      url += '&offset=' + offset
    }
    return fetch(url).then(res => res.json())
  }

  async parseApiRecords (records) {
    // this.showLog('parsing api records :', records )
    let boxes = []
    let locations = []
    records.forEach(record => {
      const location = (record.fields.location && record.fields.location !== 'N/A') ? record.fields.location : ''
      const box = record.fields.box || ''
      if (location.length && !locations.includes(location)) {
        locations.push(location)
      }
      if (box.length && !boxes.includes(box)) {
        boxes.push(box)
      }
    })
    locations = ['', 'N/A'].concat(locations.sort())
    boxes = [''].concat(boxes.sort())
    this.items = records.map(record => ({
      id: record.id,
      name: '',
      brand: '',
      details: '',
      locations,
      boxes,
      box: '',
      drawer: '',
      location: '',
      reference: '',
      'ref-printed': false,
      ...record.fields,
    }))
    this.showLog(`${this.items.length} item(s) loaded ` + this.coolAscii())
    this.initFuse()
  }

  initFuse () {
    // https://fusejs.io/
    const options = {
      threshold: 0.35, // 0 is perfect match
      keys: [{
        name: 'name',
        weight: 0.3,
      }, {
        name: 'brand',
        weight: 0.1,
      }, {
        name: 'details',
        weight: 0.2,
      }, {
        name: 'reference',
        weight: 0.3,
      }, {
        name: 'category',
        weight: 0.1,
      }], // TODO: this is not generic ^^"
    }
    this.fuse = new Fuse(this.items, options)
  }

  onSearchStart (stuff) {
    const results = this.fuse.search(stuff).map(i => i.item)
    const title = `“${stuff}”`
    this.emit('app-search-results--show', { title, results })
  }

  onSearchRetry () {
    this.emit('speech-recognition')
  }

  onStorageFound (data) {
    if (data.key === 'app-settings') {
      this.emit('app-form--settings--set', data.value)
    }
  }

  async fadeIn (el) {
    if (!el.classList.contains('hide')) {
      this.warn('please add "hide" class before mounting dom element and then call fade-in')
      return
    }
    await this.sleep(10)
    el.style.opacity = 1
  }

  async fadeOut (el, destroy = false) {
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

  showLog (message, data) {
    console.log(message, data || '')
    this.emit('app-toaster--show', { type: 'info', message })
  }

  showError (message) {
    console.error(message)
    this.emit('app-toaster--show', { type: 'error', message })
  }

  async onUpdateItem (item) {
    const fieldsToUpdate = ['name', 'brand', 'details', 'box', 'drawer', 'location', 'reference', 'ref-printed']
    this.isLoading(true)
    const data = { fields: {} }
    fieldsToUpdate.forEach(field => (data.fields[field] = item[field] || null))
    const url = this.apiUrl.replace('?', `/${item.id}?`)
    await this.patch(url, data)
    this.isLoading(false)
  }

  async patch (url, data) {
    return fetch(url, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'patch',
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(response => {
        if (response.error) {
          throw new Error(response.error.message)
        }
        return 'ok'
      })
      .catch(err => this.showError(err.message))
  }
}

// eslint-disable-next-line no-new
new App()
