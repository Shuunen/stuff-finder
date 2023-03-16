import { div, emit, fillTemplate, on, sleep } from 'shuutils'
import { delays } from '../constants'
import type { AppFormEditItemSetEvent, AppModalEditItemOpenEvent, EditItemEvent, Item } from '../types'
import { find } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'

window.customElements.define('app-edit-item', class extends HTMLElement {

  private modal: HTMLElement = div('')

  private edit (item: Item) {
    logger.info('edit', item)
    const template = find.one('template#edit-item')
    const photo = item.photo?.[0]?.url ?? ''
    const data = { ...item, photo }
    // eslint-disable-next-line no-unsanitized/property
    this.modal.innerHTML = fillTemplate(template.innerHTML, data)
    emit<AppFormEditItemSetEvent>('app-form--edit-item--set', data)
    emit<AppModalEditItemOpenEvent>('app-modal--edit-item--open')
  }

  public async connectedCallback () {
    await sleep(delays.small)
    this.modal = find.one<HTMLElement>('.app-modal--edit-item .content')
    on<EditItemEvent>('edit-item', this.edit.bind(this))
  }

  
})
