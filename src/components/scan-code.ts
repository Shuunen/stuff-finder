import { BrowserMultiFormatReader } from '@zxing/library/es2015/browser/BrowserMultiFormatReader'
import NotFoundException from '@zxing/library/es2015/core/NotFoundException'
import { dom, emit, on, sleep, tw } from 'shuutils'
import type { AppModalScanCodeCloseEvent, AppModalScanCodeOpenEvent, AppScanCodeStartEvent, AppSoundSuccessEvent, AppToasterShowEvent, SearchStartEvent } from '../types'
import { find, logger } from '../utils'

window.customElements.define('app-scan-code', class extends HTMLElement {

  private deviceId = ''

  private reader: BrowserMultiFormatReader | undefined

  private readonly video = dom('video', tw('max-h-full overflow-hidden rounded-lg object-cover'))

  public async connectedCallback (): Promise<void> {
    on<AppScanCodeStartEvent>('app-scan-code--start', this.scanCode.bind(this))
    on<AppModalScanCodeCloseEvent>('app-modal--scan-code--close', this.stopReader.bind(this))
    await this.setupModal()
  }

  private onResult (code: string): void {
    logger.log('found qr or barcode :', code)
    emit<AppModalScanCodeCloseEvent>('app-modal--scan-code--close')
    emit<AppSoundSuccessEvent>('app-sound--success')
    emit<SearchStartEvent>('search-start', { str: code, origin: 'scan' })
  }

  private async scanCode (): Promise<void> {
    logger.log('user wants to scan something')
    emit<AppModalScanCodeOpenEvent>('app-modal--scan-code--open')
    if (this.reader === undefined) await this.setupReader()
    if (this.reader === undefined) throw new Error('failed to setup reader')
    await this.reader.decodeFromVideoDevice(this.deviceId, this.video, (result, error) => {
      if (error && !(error instanceof NotFoundException)) { logger.showError(error.message, error); return }
      this.onResult(result.getText())
    })
  }

  private async setupModal (): Promise<void> {
    const modal = document.createElement('app-modal')
    modal.setAttribute('name', 'scan-code')
    modal.dataset['title'] = 'QR code scanner'
    if (!this.parentNode) throw new Error('no parentNode for setupModal')
    this.parentNode.replaceChild(modal, this)
    await sleep(100)
    this.video.addEventListener('ended', () => { logger.log('video ENDED') })
    find.one('.app-modal--scan-code').append(this.video)
  }

  private async setupReader (): Promise<void> {
    logger.log('setup reader')
    this.reader = new BrowserMultiFormatReader()
    const sources = await this.reader.listVideoInputDevices()
    logger.log('video sources found :', sources)
    const source = sources.find(s => s.label.includes('back')) ?? sources[0]
    sources.forEach(s => emit<AppToasterShowEvent>('app-toaster--show', { message: `${s.label} [${s.kind}]`, type: 'info', delay: 5000 }))
    if (!source) throw new Error('no source found for setupReader')
    this.deviceId = source.deviceId
  }

  private stopReader (): void {
    logger.log('stop reader')
    if (!this.reader) { logger.log('no reader to stop'); return }
    logger.log('reader stopping...')
    this.reader.reset()
  }
})
