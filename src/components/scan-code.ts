import { BrowserMultiFormatReader } from '@zxing/library/es2015/browser/BrowserMultiFormatReader'
import NotFoundException from '@zxing/library/es2015/core/NotFoundException'
import { dom, emit, on, sleep, tw } from 'shuutils'

window.customElements.define('app-scan-code', class extends HTMLElement {
  deviceId = ''
  reader: BrowserMultiFormatReader | undefined
  video = dom('video', tw('max-h-full overflow-hidden rounded-lg object-cover'))

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
    this.reader.decodeFromVideoDevice(this.deviceId, this.video, (result, error) => {
      if (error && !(error instanceof NotFoundException)) return console.error(error)
      if (result) this.onResult(result.getText())
    })
  }
  async setupModal (): Promise<void> {
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
    console.log('video sources found :', sources)
    const source = (sources.find(s => s.label.includes('back')) || sources[0])
    sources.forEach(s => emit<AppToasterShowEvent>('app-toaster--show', { message: `${s.label} [${s.kind}]`, type: 'info', delay: 5000 }))
    if (!source) throw new Error('no source found for setupReader')
    this.deviceId = source.deviceId
  }
  stopReader (): void {
    console.log('stop reader')
    if (!this.reader) return console.log('no reader to stop')
    console.log('reader stopping...')
    this.reader.reset()
  }
  async connectedCallback (): Promise<void> {
    on('app-scan-code--start', () => this.scanCode())
    on('app-modal--scan-code--close', () => this.stopReader())
    await this.setupModal()
  }
})
