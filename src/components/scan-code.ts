import { BrowserMultiFormatReader } from '@zxing/library/es2015/browser/BrowserMultiFormatReader'
import NotFoundException from '@zxing/library/es2015/core/NotFoundException'
import { dom, emit, on, sleep } from 'shuutils'

window.customElements.define('app-scan-code', class extends HTMLElement {
  device = ''
  reader: BrowserMultiFormatReader | undefined
  video = dom('video', 'rounded-lg max-h-full overflow-hidden object-cover')

  onResult (code: string): void {
    console.log('found qr or barcode :', code)
    emit('app-modal--close')
    emit('app-sound--success')
    emit<SearchStartEvent>('search-start', { str: code, origin: 'scan' })
  }
  async scanCode (): Promise<void> {
    console.log('user wants to scan something')
    emit('app-modal--scan-code--open')
    if (this.reader === undefined) await this.setupReader()
    if (this.reader === undefined) throw new Error('failed to setup reader')
    this.reader.decodeFromVideoDevice(this.device, this.video, (result, error) => {
      if (error && !(error instanceof NotFoundException)) return console.error(error)
      if (result) this.onResult(result.getText())
    })
  }
  async setupModal (): Promise<void> {
    on('app-modal--close', () => this.stopReader())
    const modal = document.createElement('app-modal')
    modal.setAttribute('name', 'scan-code')
    modal.dataset['title'] = 'QR code scanner'
    if (!this.parentNode) throw new Error('no parentNode for setupModal')
    this.parentNode.replaceChild(modal, this)
    await sleep(100)
    this.video.addEventListener('ended', () => console.log('video ENDED'))
    const container = document.querySelector('.app-modal--scan-code')
    if (!container) throw new Error('no container for setupModal')
    container.append(this.video)
  }
  async setupReader (): Promise<void> {
    console.log('setup reader')
    this.reader = new BrowserMultiFormatReader()
    const sources = await this.reader.listVideoInputDevices()
    const device = (sources.find(s => s.label.includes('back')) || sources[0])?.deviceId
    if (!device) throw new Error('no device for setupReader')
    this.device = device
    console.log('sources ?', sources)
  }
  stopReader (): void {
    if (!this.reader) return
    console.log('stop reader')
    this.reader.reset()
  }
  async connectedCallback (): Promise<void> {
    on('app-scan-code--start', this.scanCode)
    await this.setupModal()
  }
})
