import { fillTemplate, on, sleep, storage } from 'shuutils'
import { itemToPrintData } from '../services/print.service'

window.customElements.define('app-print-one', class extends HTMLElement {
  data: PrintData | undefined
  item: Item | undefined
  previewElement?: HTMLElement
  size: PrintSize = '40x30'

  findItem (id?: PrintOneEvent): Item {
    if (!id) throw new Error('cannot find item without id')
    const items = storage.get<Item[]>('items', [])
    if (!items) throw new Error('no items found')
    const item = items.find(item => item.id === id)
    if (!item) throw new Error('no item found in items')
    console.log('found item to preview in', this.size, item)
    return item
  }
  preview (id?: PrintOneEvent): void {
    console.log('preview in', this.size)
    this.item = this.item ?? this.findItem(id)
    const template = document.querySelector(`template#print-one--${this.size}`)
    if (!template) return console.error('no edit-item template found')
    if (!this.previewElement) return console.error('no preview element')
    this.data = itemToPrintData(this.item)
    this.previewElement.innerHTML = fillTemplate(template.innerHTML + '<div class="font-mono mt-4">QR Code value : {{ qrCodeValue }}</div>', { ...this.data })
    sleep(300).then(() => this.doPrintOne())
  }
  onFormChange (form: PrintOneFormData): void {
    console.log('print one form change', form)
    this.size = form.size
    if (this.item) this.preview()
  }
  doPrintOne (): void {
    console.log('do print one', this.data)
    window.print()
  }
  onClose (): void {
    console.log('print one modal closed')
    this.item = undefined
  }
  async connectedCallback (): Promise<void> {
    await sleep(100)
    const previewElement = document.querySelector<HTMLElement>('.app-print-one--preview')
    if (!previewElement) return console.error('no print one modal found')
    this.previewElement = previewElement
    if (customElements.get('qr-code') === undefined) require('webcomponent-qr-code')
    on<PrintOneEvent>('print-one', this.preview.bind(this))
    on('app-modal--print-one--close', this.onClose.bind(this))
    on<PrintOneEvent>('app-modal--print-one--open', this.preview.bind(this))
    on<PrintOneFormData>('app-form--print-one--change', this.onFormChange.bind(this))
    on<PrintOneSubmitEvent>('do-print-one', this.doPrintOne.bind(this))
  }
})
