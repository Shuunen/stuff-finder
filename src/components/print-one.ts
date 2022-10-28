import { fillTemplate, on, sleep } from 'shuutils'
import { inputToPrintData } from '../services/print.service'

window.customElements.define('app-print-one', class extends HTMLElement {
  data: PrintData | undefined
  previewElement?: HTMLElement
  size: PrintSize | undefined

  preview (input?: PrintOneInputData): void {
    console.log('preview in', this.size)
    if (!this.data) this.data = input === undefined ? undefined : inputToPrintData(input)
    if (!this.data) return console.error('no data or input to print')
    const template = document.querySelector(`template#print-one--${this.size}`)
    if (!template) return console.error('no edit-item template found')
    if (!this.previewElement) return console.error('no preview element')
    this.previewElement.innerHTML = fillTemplate(template.innerHTML + '<div class="font-mono mt-4">QR Code value : {{ qrCodeValue }}</div>', { ...this.data })
    sleep(300).then(() => this.doPrintOne())
  }
  onFormChange (form: PrintOneFormData): void {
    console.log('print one form change', form)
    this.size = form.size
    if (this.data) this.preview()
  }
  doPrintOne (): void {
    console.log('do print one', this.data)
    window.print()
  }
  onClose (): void {
    console.log('print one modal closed')
    this.data = undefined
  }
  async connectedCallback (): Promise<void> {
    await sleep(100)
    const previewElement = document.querySelector<HTMLElement>('.app-print-one--preview')
    if (!previewElement) return console.error('no print one modal found')
    this.previewElement = previewElement
    if (customElements.get('qr-code') === undefined) require('webcomponent-qr-code')
    on<PrintOneInputData>('print-one', this.preview.bind(this))
    on('app-modal--print-one--close', this.onClose.bind(this))
    on<PrintOneInputData>('app-modal--print-one--open', this.preview.bind(this))
    on<PrintOneFormData>('app-form--print-one--change', this.onFormChange.bind(this))
    on<PrintOneSubmitEvent>('do-print-one', this.doPrintOne.bind(this))
  }
})
