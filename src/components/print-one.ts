import { div, fillTemplate, on, sleep } from 'shuutils'
import { inputToPrintData } from '../services/print.service'
import { find, logger } from '../utils'

window.customElements.define('app-print-one', class extends HTMLElement {
  data: PrintData | undefined
  previewElement = div('')
  size: PrintFormDataSize = '40x20'

  async preview (input?: PrintInputData): Promise<void> {
    logger.log('preview in', this.size)
    if (!this.data) this.data = input === undefined ? undefined : inputToPrintData(input)
    if (!this.data) return logger.showError('no data or input to print')
    const template = find.one(`template#print-one--${this.size}`)
    this.previewElement.innerHTML = fillTemplate(template.innerHTML + '<div class="font-mono mt-4">QR Code value : {{ qrCodeValue }}</div>', { ...this.data })
    await this.adjustQrCode()
    this.doPrintOne()
  }
  async adjustQrCode (): Promise<void> {
    // sometimes some qr code are too big and need to be resized to fit the barcode
    const preview = find.one('.app-barcode', this.previewElement)
    const maxHeight = preview.scrollHeight - 5
    await sleep(200)
    const wc = find.one<HTMLElement>('qr-code', this.previewElement)
    // reducing the module size do the trick & reduce their display size
    if (!wc.shadowRoot) return logger.showError('no shadowRoot for qr-code custom element', wc)
    if (!wc.shadowRoot.firstElementChild) return logger.showError('no firstElementChild for qr-code custom element shadowRoot', wc.shadowRoot)
    const height = wc.shadowRoot.firstElementChild.scrollHeight
    if (height <= maxHeight) return logger.log(`qr code size is ok (${height}px <= ${maxHeight}px)`)
    logger.log(`qr code size has been reduced, it was too big (${height}px > ${maxHeight}px)`)
    wc.setAttribute('modulesize', '2')
  }
  onFormChange (form: PrintFormData): void {
    logger.log('print one form change', form)
    this.size = form.size
    if (this.data) void this.preview()
  }
  doPrintOne (): void {
    logger.log('do print one', this.data)
    window.print()
  }
  onClose (): void {
    logger.log('print one modal closed')
    this.data = undefined
  }
  async connectedCallback (): Promise<void> {
    await sleep(100)
    this.previewElement = find.one<HTMLDivElement>('.app-print-one--preview')
    if (customElements.get('qr-code') === undefined) require('webcomponent-qr-code')
    on<AppFormPrintOneChangeEvent>('app-form--print-one--change', this.onFormChange.bind(this))
    on<AppFormPrintOneReadyEvent>('app-form--print-one--ready', this.onFormChange.bind(this))
    on<AppModalPrintOneCloseEvent>('app-modal--print-one--close', this.onClose.bind(this))
    on<AppModalPrintOneOpenEvent>('app-modal--print-one--open', this.preview.bind(this))
    on<DoPrintOneEvent>('do-print-one', this.doPrintOne.bind(this))
    on<PrintOneEvent>('print-one', this.preview.bind(this))
  }
})
