import { div, fillTemplate, on, sleep } from 'shuutils'
import { inputToPrintData } from '../services/print.service'
import { find, logger } from '../utils'

window.customElements.define('app-print-one', class extends HTMLElement {
  data: PrintData | undefined
  previewElement = div('')
  size: PrintSize | undefined

  preview (input?: PrintOneInputData): void {
    logger.log('preview in', this.size)
    if (!this.data) this.data = input === undefined ? undefined : inputToPrintData(input)
    if (!this.data) return logger.showError('no data or input to print')
    const template = find.one(`template#print-one--${this.size}`)
    this.previewElement.innerHTML = fillTemplate(template.innerHTML + '<div class="font-mono mt-4">QR Code value : {{ qrCodeValue }}</div>', { ...this.data })
    sleep(300).then(() => this.doPrintOne())
  }
  onFormChange (form: PrintOneFormData): void {
    logger.log('print one form change', form)
    this.size = form.size
    if (this.data) this.preview()
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
    on<PrintOneInputData>('print-one', this.preview.bind(this))
    on('app-modal--print-one--close', this.onClose.bind(this))
    on<PrintOneInputData>('app-modal--print-one--open', this.preview.bind(this))
    on<PrintOneFormData>('app-form--print-one--change', this.onFormChange.bind(this))
    on<PrintOneSubmitEvent>('do-print-one', this.doPrintOne.bind(this))
  }
})
