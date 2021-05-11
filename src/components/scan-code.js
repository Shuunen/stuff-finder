/* global window, document, HTMLElement */
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'
import { emit, on, sleep } from 'shuutils'
import { SEARCH_ORIGIN } from '../constants.js'
import { dom } from '../utils.js'

class AppScanCode extends HTMLElement {
  async initReader() {
    console.log('init reader')
    this.reader = new BrowserMultiFormatReader()
    const sources = await this.reader.listVideoInputDevices()
    this.device = (sources.find(s => s.label.includes('back')) || sources[0]).deviceId
    console.log('sources ?', sources)
  }

  onResult(code) {
    console.log('found qr or barcode :', code)
    emit('app-modal--scan-code--close')
    emit('app-sound--success')
    emit('search-start', { str: code, origin: SEARCH_ORIGIN.scan })
  }

  async scanCode() {
    console.log('user wants to scan something')
    emit('app-modal--scan-code--open')
    if (this.reader === undefined) await this.initReader()
    this.reader.decodeFromVideoDevice(this.device, this.els.video, (result, error) => {
      if (error && !(error instanceof NotFoundException)) return console.error(error)
      if (result) return this.onResult(result.text)
    })
  }

  async initModal() {
    on('app-modal--scan-code--closed', () => this.reader.reset())
    let modal = dom('app-modal')
    modal.name = 'scan-code'
    this.parentNode.replaceChild(modal, this)
    await sleep(100)
    modal = document.querySelector('.app-modal--scan-code')
    modal.classList.add('center')
    modal.append(dom('h2', 'QR code scanner'))
    modal.append(this.els.video)
  }

  async connectedCallback() {
    on('app-scan-code--start', () => this.scanCode())
    this.els = {}
    this.els.video = dom('video')
    await this.initModal()
  }
}

window.customElements.define('app-scan-code', AppScanCode)
