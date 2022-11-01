import { div, emit, fillTemplate, on, sleep } from 'shuutils'
import { find, logger } from '../utils'

window.customElements.define('app-edit-item', class extends HTMLElement {
  modal: HTMLElement = div('')
  edit (item: Item): void {
    logger.log('edit', item)
    const template = find.one('template#edit-item')
    const photo = item.photo?.[0]?.url ?? ''
    const data = { photo, ...item }
    this.modal.innerHTML = fillTemplate(template.innerHTML, data)
    emit<AppFormEditItemSetEvent>('app-form--edit-item--set', item)
    emit<AppModalEditItemOpenEvent>('app-modal--edit-item--open')
  }
  async connectedCallback (): Promise<void> {
    await sleep(100)
    this.modal = find.one<HTMLElement>('.app-modal--edit-item .content')
    on<EditItemEvent>('edit-item', this.edit.bind(this))
  }
})
