import { div, emit, fillTemplate, on, storage, tw } from 'shuutils'
import { EMPTY_COMMON_LISTS } from '../constants'
import { button, find, logger } from '../utils'

window.customElements.define('app-print-barcodes', class extends HTMLElement {
  barcodes: Item[] = []
  selection: string[] = []
  previewButton = button('Preview', tw('app-preview mx-auto mt-2 hidden sm:block'))
  previewError = div('app-preview app-error text-center font-medium leading-9 text-red-500')
  modal = div('')
  trigger = this.createTrigger()
  updatePreviewButton (): void {
    this.selection = find.all<HTMLInputElement>('input[data-action="barcodes-select-one"]:checked').map((element) => element.id)
    this.previewButton.disabled = this.selection.length <= 0 || this.selection.length > 65
    this.previewButton.textContent = `Preview ${this.selection.length} barcodes`
    this.previewError.textContent = ''
    if (!this.previewButton.disabled) return
    if (this.selection.length <= 0) this.previewError.textContent = 'You need to select at least one item'
    if (this.selection.length > 65) this.previewError.textContent = 'You cannot select more than 65 items'
  }
  setAllItems (selected = true): void {
    find.all<HTMLInputElement>('input[data-action="barcodes-select-one"]', this.modal).forEach((element) => {
      if (!(element instanceof HTMLInputElement)) return logger.showError('setAllItems, element is not an input element', element)
      element.checked = selected
    })
    this.updatePreviewButton()
  }
  selectValidItems (): void {
    this.setAllItems(false)
    const forms = find.all<HTMLFormElement>('.app-list app-form', this.modal)
    forms.forEach(form => {
      // check valid form related checkbox
      const formValid = form.dataset['valid'] === 'true'
      if (!formValid) return
      const element = find.one('#' + form.name)
      if (element instanceof HTMLInputElement) element.checked = true
    })
    this.updatePreviewButton()
  }
  async adjustQrCodes (): Promise<void> {
    // sometimes some qr code are too big
    find.all('qr-code').forEach(wc => {
      // reducing their module size do the trick & reduce their display size
      if (!wc.shadowRoot) return logger.showError('no shadowRoot for qr-code custom element', wc)
      if (!wc.shadowRoot.firstElementChild) return logger.showError('no firstElementChild for qr-code custom element shadowRoot', wc.shadowRoot)
      const height = wc.shadowRoot.firstElementChild.getAttribute('height')
      if (!height) return
      if (Number.parseInt(height) > 63) wc.setAttribute('modulesize', '2')
    })
  }
  onPreview (): void {
    logger.log('user wants to see preview')
    if (customElements.get('qr-code') === undefined) require('webcomponent-qr-code')
    emit('app-modal--print-barcodes--open')
    const list = find.one('.app-modal--print-barcodes .app-barcodes')
    list.innerHTML = ''
    const barcodes = this.barcodes.filter(b => this.selection.includes(b.id))
    barcodes.forEach(b => {
      const wc = `<qr-code data="${b.reference.trim()}" margin=0 modulesize=3></qr-code>`
      const code = div('app-barcode', wc)
      const col = div('app-col')
      col.append(div('app-name', [b.name, b.brand, b.details].join(' ').trim()))
      col.append(div('app-location', b.box ? (b.box[0] + b.drawer) : b.location))
      code.append(col)
      list.append(code)
    })
    this.adjustQrCodes()
  }
  handlePreview (): void {
    find.allOrNone('button.app-preview, .app-preview.app-error', this.modal).forEach(element => element.remove())
    this.previewButton.disabled = true
    this.previewButton.dataset['action'] = 'barcodes-preview'
    this.modal.append(this.previewError, this.previewButton)
  }
  async openModal (): Promise<void> {
    this.modal = find.one<HTMLDivElement>('.app-modal--prepare-barcodes')
    const listElement = find.one('.app-list', this.modal)
    const item = find.one('template#barcodes-list-item')
    const template = item.innerHTML
    const lists = storage.get<CommonLists>('lists', EMPTY_COMMON_LISTS)
    if (!lists.boxes) throw new Error('failed to get lists')
    listElement.innerHTML = this.barcodes.map(bar => {
      const boxes = lists.boxes.map(box => `<option value="${box}" ${box.toLowerCase() === bar.box.toLowerCase() ? 'selected' : ''}>${box}</option>`).join('')
      const drawers = ['', 1, 2, 3, 4, 5, 6, 7].map(d => `<option value="${d}" ${d.toString().toLowerCase() === bar.drawer.toLowerCase() ? 'selected' : ''}>${d}</option>`).join('')
      return fillTemplate(template, { id: bar.id, name: bar.name, brand: bar.brand, details: bar.details, reference: bar.reference, boxes, drawers })
    }).join('')
    this.handlePreview()
    this.selectValidItems()
    emit('app-modal--prepare-barcodes--open')
    emit<AppLoaderToggleEvent>('app-loader--toggle', false)
  }
  createTrigger (): HTMLDivElement {
    const icon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><defs/><path fill="currentColor" fill-rule="evenodd" d="M8 4h8v2H8V4zm10 2h4v12h-4v4H6v-4H2V6h4V2h12v4zm2 10h-2v-2H6v2H4V8h16v8zM8 16h8v4H8v-4zm0-6H6v2h2v-2z" clip-rule="evenodd"/></svg>'
    const wrapper = div('app-prepare-barcodes-trigger absolute top-5 right-20 hidden h-10 w-10 cursor-pointer text-purple-400 transition-colors hover:text-purple-600', icon)
    wrapper.title = 'Open print barcodes'
    wrapper.addEventListener('click', () => emit('get-barcodes-to-print'))
    return wrapper
  }
  async onBarcodes (barcodes: Item[]): Promise<void> {
    this.barcodes = barcodes.sort(a => a.reference ? -1 : 1)
    this.openModal()
  }
  connectedCallback (): void {
    on('barcodes-to-print', (barcodes: Item[]) => this.onBarcodes(barcodes))
    on('items-ready', () => (this.trigger.classList.remove('hidden')))
    on('barcodes-select-all', () => this.setAllItems(true))
    on('barcodes-select-none', () => this.setAllItems(false))
    on('barcodes-select-one', () => this.updatePreviewButton())
    on('barcodes-select-valid', () => this.selectValidItems())
    on('barcodes-preview', () => this.onPreview())
    on('barcodes-print', () => window.print())
    if (!this.parentNode) return logger.showError('no parentNode for barcodes-print-modal')
    this.parentNode.replaceChild(this.trigger, this)
  }
})
