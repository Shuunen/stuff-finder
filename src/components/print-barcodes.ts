import { div, emit, fillTemplate, on } from 'shuutils'
import { Item } from '../types/item'
import { button } from '../utils'

window.customElements.define('app-print-barcodes', class extends HTMLElement {
  barcodes: Item[] = []
  selection: string[] = []
  previewButton: HTMLButtonElement
  previewError: HTMLDivElement
  modal: HTMLDivElement
  trigger: HTMLDivElement
  updatePreviewButton () {
    this.selection = [...document.querySelectorAll('input[data-action="select-one"]:checked')].map(element => element.id)
    this.previewButton.disabled = this.selection.length <= 0 || this.selection.length > 65
    this.previewButton.textContent = `Preview ${this.selection.length} barcodes`
    this.previewError.textContent = ''
    if (!this.previewButton.disabled) return
    if (this.selection.length <= 0) this.previewError.textContent = 'You need to select at least one item'
    if (this.selection.length > 65) this.previewError.textContent = 'You cannot select more than 65 items'
  }
  setAllItems (selected = true) {
    document.querySelectorAll('input[data-action="select-one"]').forEach((element) => {
      (element as HTMLInputElement).checked = selected
    })
  }
  selectValidItems () {
    this.setAllItems(false)
    const forms = [...this.modal.querySelectorAll('.list app-form')]
    forms.forEach(form => {
      // check valid form related checkbox
      if (form.getAttribute('valid') === 'true') (document.querySelector('#' + (form as HTMLFormElement).name) as HTMLInputElement).checked = true
    })
    this.updatePreviewButton()
  }
  onPreview () {
    console.log('user wants to see preview')
  }
  onClick (event) {
    const action = event.target.getAttribute('data-action')
    console.log('action clicked :', action)
    if (!action) return
    if (action === 'select-all') this.setAllItems(true)
    if (action === 'select-none') this.setAllItems(false)
    if (action === 'select-valid') this.selectValidItems()
    if (action === 'preview') return this.onPreview()
    this.updatePreviewButton()
  }
  handlePreview () {
    this.previewButton = button('Preview', 'mx-auto mt-4 hidden sm:block')
    this.previewButton.disabled = true
    this.previewButton.dataset.action = 'preview'
    this.previewError = div('preview error mt-4 text-center font-medium text-red-500')
    this.modal.append(this.previewError, this.previewButton)
  }
  openModal () {
    this.modal = document.querySelector('.app-modal--print-barcodes')
    if (!this.modal) return console.error('failed to find modal element')
    const listElement = this.modal.querySelector('.list')
    const template = document.querySelector('template#print-barcodes-list-item').innerHTML
    console.log(this.barcodes[0])
    listElement.innerHTML = this.barcodes.map(bar => {
      const boxes = bar.boxes.map(box => `<option value="${box}" ${box.toLowerCase() === bar.box.toLowerCase() ? 'selected' : ''}>${box}</option>`).join('')
      const drawers = ['', 1, 2, 3, 4, 5, 6, 7].map(d => `<option value="${d}" ${d.toString().toLowerCase() === bar.drawer.toLowerCase() ? 'selected' : ''}>${d}</option>`).join('')
      return fillTemplate(template, { id: bar.id, name: bar.name, brand: bar.brand, details: bar.details, reference: bar.reference, boxes, drawers })
    }).join('')
    this.handlePreview()
    this.selectValidItems()
    this.modal.addEventListener('click', event => this.onClick(event))
    emit('app-modal--print-barcodes--open')
    emit('app-loader--toggle', false)
  }
  createTrigger () {
    const icon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><defs/><path fill="currentColor" fill-rule="evenodd" d="M8 4h8v2H8V4zm10 2h4v12h-4v4H6v-4H2V6h4V2h12v4zm2 10h-2v-2H6v2H4V8h16v8zM8 16h8v4H8v-4zm0-6H6v2h2v-2z" clip-rule="evenodd"/></svg>'
    const wrapper = div('app-print-barcodes-trigger hidden transition-colors text-purple-400 hover:text-purple-600 absolute top-5 right-20 h-10 w-10 cursor-pointer', icon)
    wrapper.title = 'Open print barcodes'
    wrapper.addEventListener('click', () => emit('get-barcodes-to-print'))
    return wrapper
  }
  async onBarcodes (barcodes) {
    this.barcodes = barcodes.sort(a => a.reference ? -1 : 1)
    this.openModal()
  }
  connectedCallback () {
    this.trigger = this.createTrigger()
    on('barcodes-to-print', barcodes => this.onBarcodes(barcodes))
    on('items-ready', () => (this.trigger.classList.remove('hidden')))
    this.parentNode.replaceChild(this.trigger, this)
  }
})
