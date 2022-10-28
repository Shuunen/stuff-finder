import { fillTemplate, on, sleep, storage } from 'shuutils'
import { printService } from '../services/print.service'

window.customElements.define('app-print-one', class extends HTMLElement {
  data: PrintData = { text: '', barcode: '', location: '' }
  previewElement?: HTMLElement
  size: PrintSize = '40x30'
  preview (id: PrintOneEvent): void {
    console.log('preview', id)
    const items = storage.get<Item[]>('items', [])
    if (!items) return console.error('no items, cannot preview')
    const item = items.find(item => item.id === id)
    if (!item) return console.error('no item, cannot preview')
    console.log('found item to preview in', this.size, item)
    const template = document.querySelector(`template#print-one--${this.size}`)
    if (!template) return console.error('no edit-item template found')
    if (!this.previewElement) return console.error('no preview element')
    this.data = printService.getData(item)
    this.previewElement.innerHTML = fillTemplate(template.innerHTML, { ...this.data })
  }
  onFormChange (form: PrintOneFormReadyEvent): void {
    console.log('print one form change', form)
    this.size = form.size
  }
  doPrintOne (): void {
    console.log('do print one', this.data)
  }
  async connectedCallback (): Promise<void> {
    await sleep(100)
    const previewElement = document.querySelector<HTMLElement>('.app-print-one--preview')
    if (!previewElement) return console.error('no print one modal found')
    this.previewElement = previewElement
    on<PrintOneEvent>('print-one', this.preview.bind(this))
    on<PrintOneEvent>('app-modal--print-one--open', this.preview.bind(this))
    on<PrintOneFormReadyEvent>('app-form--print-one--ready', this.onFormChange.bind(this))
    on<PrintOneSubmitEvent>('do-print-one', this.doPrintOne.bind(this))
  }
})
