import { BrowserMultiFormatReader } from '@zxing/library/es2015/browser/BrowserMultiFormatReader'
import notFoundException from '@zxing/library/es2015/core/NotFoundException'
import { dom, emit, on, sleep, tw } from 'shuutils'
import { delays } from '../constants'
import type { AppModalScanCodeCloseEvent, AppModalScanCodeOpenEvent, AppScanCodeStartEvent, AppSoundSuccessEvent, SearchStartEvent } from '../types/events.types'
import { find } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'

window.customElements.define('app-scan-code', class extends HTMLElement {

  private deviceId = ''

  private reader: BrowserMultiFormatReader | undefined

  private readonly video = dom('video', tw('max-h-full overflow-hidden rounded-lg object-cover'))

  private onResult (code: string) {
    logger.info('found qr or barcode :', code)
    emit<AppModalScanCodeCloseEvent>('app-modal--scan-code--close')
    emit<AppSoundSuccessEvent>('app-sound--success')
    emit<SearchStartEvent>('search-start', { origin: 'scan', str: code })
  }

  private stopReader () {
    logger.info('stop reader')
    if (!this.reader) { logger.info('no reader to stop'); return }
    logger.info('reader stopping...')
    this.reader.reset()
  }

  public async connectedCallback () {
    on<AppScanCodeStartEvent>('app-scan-code--start', this.scanCode.bind(this))
    on<AppModalScanCodeCloseEvent>('app-modal--scan-code--close', this.stopReader.bind(this))
    await this.setupModal()
  }

  private async scanCode () {
    logger.info('user wants to scan something')
    emit<AppModalScanCodeOpenEvent>('app-modal--scan-code--open')
    if (this.reader === undefined) await this.setupReader()
    if (this.reader === undefined) throw new Error('failed to setup reader')
    await this.reader.decodeFromVideoDevice(this.deviceId, this.video, (result, error) => {
      if (error && !(error instanceof notFoundException)) { logger.showError(error.message, error); return }
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (result === null) return
      this.onResult(result.getText())
    })
  }

  private async setupModal () {
    const modal = document.createElement('app-modal')
    modal.setAttribute('name', 'scan-code')
    modal.dataset.title = 'QR code scanner'
    if (!this.parentNode) throw new Error('no parentNode for setupModal')
    this.parentNode.replaceChild(modal, this)
    await sleep(delays.small)
    this.video.addEventListener('ended', () => { logger.info('video ENDED') })
    find.one('.app-modal--scan-code').append(this.video)
  }

  private async setupReader () {
    logger.info('setup reader')
    this.reader = new BrowserMultiFormatReader()
    const sources = await this.reader.listVideoInputDevices()
    logger.info('video sources found :', sources)
    const source = sources.find(aSource => aSource.label.includes('back')) ?? sources[0]
    if (!source) throw new Error('no source found for setupReader')
    this.deviceId = source.deviceId
  }

})
