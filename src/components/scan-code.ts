import { BrowserMultiFormatReader } from '@zxing/library/es2015/browser/BrowserMultiFormatReader'
import NotFoundException from '@zxing/library/es2015/core/NotFoundException'
import { dom, emit, on, sleep } from 'shuutils'
import { SEARCH_ORIGIN } from '../constants'

window.customElements.define('app-scan-code', class extends HTMLElement {
  device = ''
  reader: BrowserMultiFormatReader
  video = dom('video', 'rounded-lg max-h-full overflow-hidden object-cover')

  onResult (code) {
    console.log('found qr or barcode :', code)
    emit('app-modal--close')
    emit('app-sound--success')
    emit('search-start', { str: code, origin: SEARCH_ORIGIN.scan })
  }

  async scanCode () {
    console.log('user wants to scan something')
    emit('app-modal--scan-code--open')
    if (this.reader === undefined) await this.setupReader()
    this.reader.decodeFromVideoDevice(this.device, this.video, (result, error) => {
      if (error && !(error instanceof NotFoundException)) return console.error(error)
      if (result) this.onResult((result as unknown as { text: string }).text)
    })
  }

  async setupModal () {
    on('app-modal--close', () => this.stopReader())
    const modal = document.createElement('app-modal')
    modal.setAttribute('name', 'scan-code')
    modal.dataset.title = 'QR code scanner'
    this.parentNode.replaceChild(modal, this)
    await sleep(100)
    this.video.addEventListener('ended', () => console.log('video ENDED'))
    document.querySelector('.app-modal--scan-code').append(this.video)
  }

  async setupReader () {
    console.log('setup reader')
    this.reader = new BrowserMultiFormatReader()
    const sources = await this.reader.listVideoInputDevices()
    this.device = (sources.find(s => s.label.includes('back')) || sources[0]).deviceId
    console.log('sources ?', sources)
  }

  stopReader () {
    if (!this.reader) return
    console.log('stop reader')
    this.reader.reset()
  }

  async connectedCallback () {
    on('app-scan-code--start', () => this.scanCode())
    await this.setupModal()
  }
})
