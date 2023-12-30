import { div, fillTemplate, on, sleep } from 'shuutils'
import { delays } from '../constants'
import type { AppFormPrintOneChangeEvent, AppFormPrintOneReadyEvent, AppModalPrintOneCloseEvent, AppModalPrintOneOpenEvent, DoPrintOneEvent, PrintOneEvent } from '../types/events.types'
import { PrintFormDataSize, type PrintData, type PrintFormData, type PrintInputData } from '../types/print.types'
import { find } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'
import { inputToPrintData } from '../utils/print.utils'

window.customElements.define('app-print-one', class extends HTMLElement {

  private data: PrintData | undefined

  private previewElement = div('')

  private size = PrintFormDataSize.Rect40x20

  private onFormChange (form: PrintFormData) {
    logger.info('print one form change', form)
    this.size = form.size
    if (this.data) void this.preview()
  }

  private doPrintOne () {
    logger.info('do print one', this.data)
    window.print()
  }

  private onClose () {
    logger.info('print one modal closed')
    this.data = undefined
  }

  public async connectedCallback () {
    await sleep(delays.small)
    this.previewElement = find.one<HTMLDivElement>('.app-print-one--preview')
    // @ts-expect-error missing types
    if (customElements.get('qr-code') === undefined) import('webcomponent-qr-code')
    on<AppFormPrintOneChangeEvent>('app-form--print-one--change', this.onFormChange.bind(this))
    on<AppFormPrintOneReadyEvent>('app-form--print-one--ready', this.onFormChange.bind(this))
    on<AppModalPrintOneCloseEvent>('app-modal--print-one--close', this.onClose.bind(this))
    on<AppModalPrintOneOpenEvent>('app-modal--print-one--open', this.preview.bind(this))
    on<DoPrintOneEvent>('do-print-one', this.doPrintOne.bind(this))
    on<PrintOneEvent>('print-one', this.preview.bind(this))
  }

  private async preview (input?: PrintInputData) {
    logger.info('preview in', this.size)
    if (!this.data) this.data = input === undefined ? undefined : inputToPrintData(input)
    if (!this.data) { logger.showError('no data or input to print'); return }
    const template = find.one(`template#print-one--${this.size}`)
    // eslint-disable-next-line no-unsanitized/property
    this.previewElement.innerHTML = fillTemplate(`${template.innerHTML}<div class="font-mono mt-4">QR Code value : {{ qrCodeValue }}</div>`, { ...this.data })
    await this.adjustQrCode()
    this.doPrintOne()
  }

  // eslint-disable-next-line max-statements
  private async adjustQrCode () {
    // sometimes some qr code are too big and need to be resized to fit the barcode
    const preview = find.one('.app-barcode', this.previewElement)
    const margin = 5
    const maxHeight = preview.scrollHeight - margin
    await sleep(delays.medium)
    const wc = find.one<HTMLElement>('qr-code', this.previewElement)
    // reducing the module size do the trick & reduce their display size
    if (!wc.shadowRoot) { logger.showError('no shadowRoot for qr-code custom element', wc); return }
    if (!wc.shadowRoot.firstElementChild) { logger.showError('no firstElementChild for qr-code custom element shadowRoot', wc.shadowRoot); return }
    const height = wc.shadowRoot.firstElementChild.scrollHeight
    if (height <= maxHeight) { logger.info(`qr code size is ok (${height}px <= ${maxHeight}px)`); return }
    logger.info(`qr code size has been reduced, it was too big (${height}px > ${maxHeight}px)`)
    wc.setAttribute('modulesize', '2')
  }






})
