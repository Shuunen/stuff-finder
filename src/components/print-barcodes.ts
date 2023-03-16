import { div, emit, fillTemplate, on, storage, tw } from 'shuutils'
import { emptyCommonLists, emptyItem } from '../constants'
import { ItemField, ItemStatus, type AppLoaderToggleEvent, type AppModalPrepareBarcodesOpenEvent, type Item, type ItemsReadyEvent } from '../types'
import { find, valuesToOptions } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'

window.customElements.define('app-print-barcodes', class extends HTMLElement {

  private items: Item[] = []

  private modal = div('')

  private readonly trigger = this.createTrigger()

  public connectedCallback () {
    on<ItemsReadyEvent>('items-ready', this.showTrigger.bind(this))
    if (!this.parentNode) { logger.showError('no parentNode for barcodes-print-modal'); return }
    this.parentNode.replaceChild(this.trigger, this)
  }

  private openModal () {
    this.modal = find.one<HTMLDivElement>('.app-modal--prepare-barcodes')
    const listElement = find.one('.app-list', this.modal)
    const item = find.one('template#barcodes-list-item')
    const template = item.innerHTML
    const lists = storage.get<typeof emptyCommonLists>('lists', emptyCommonLists)
    logger.info('got lists', lists)
    // eslint-disable-next-line no-unsanitized/property
    listElement.innerHTML = this.items
      .map(anItem => fillTemplate(template, { ...emptyItem, ...anItem, boxes: valuesToOptions(lists.boxes, anItem.box), drawers: valuesToOptions(lists.drawers, anItem.drawer) }))
      .join('')
    emit<AppModalPrepareBarcodesOpenEvent>('app-modal--prepare-barcodes--open')
    emit<AppLoaderToggleEvent>('app-loader--toggle', false)
  }

  private createTrigger () {
    const icon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><defs/><path fill="currentColor" fill-rule="evenodd" d="M8 4h8v2H8V4zm10 2h4v12h-4v4H6v-4H2V6h4V2h12v4zm2 10h-2v-2H6v2H4V8h16v8zM8 16h8v4H8v-4zm0-6H6v2h2v-2z" clip-rule="evenodd"/></svg>'
    const wrapper = div(tw('app-prepare-barcodes-trigger absolute top-5 right-20 hidden h-10 w-10 cursor-pointer text-purple-400 transition-colors hover:text-purple-600'), icon)
    wrapper.title = 'Open print barcodes'
    wrapper.addEventListener('click', this.findItemsToPrint.bind(this))
    return wrapper
  }

  private findItemsToPrint () {
    const items = storage.get<Item[]>('items', [])
    if (items.length === 0) { logger.showError('no items found in storage'); return }
    logger.info(`found ${items.length} items in storage`)
    const printable = items.filter(item => !item[ItemField.ReferencePrinted] && item.status === ItemStatus.Acheté)
    logger.info(`found ${printable.length} printable items`)
    this.items = printable
    this.openModal()
  }

  private showTrigger () {
    this.trigger.classList.remove('hidden')
  }
})
