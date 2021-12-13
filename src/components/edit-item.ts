import { emit, fillTemplate, on, sleep } from 'shuutils'

window.customElements.define('app-edit-item', class extends HTMLElement {
  modal?: HTMLElement
  edit (item: Item) {
    console.log('edit', item)
    const template = document.querySelector('template#edit-item')
    if (!template) return console.error('no edit-item template found')
    const photo = item.photo === undefined ? '' : item.photo[0].url
    const data = { id: item.id, photo }
    if (!this.modal) return console.error('no modal')
    this.modal.innerHTML = fillTemplate(template.innerHTML, data)
    emit('app-form--edit-item--set', item)
    const printed = this.modal.querySelector('input[name="ref-printed"]') as HTMLInputElement
    printed.checked = data['ref-printed']
    emit('app-modal--edit-item--open')
  }
  async connectedCallback () {
    await sleep(100)
    const modal = document.querySelector<HTMLElement>('.app-modal--edit-item .content')
    if (!modal) return console.error('no modal')
    this.modal = modal
    on('edit-item', (item: Item) => this.edit(item))
  }
})
