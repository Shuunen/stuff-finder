import { emit, fillTemplate, on, sleep } from 'shuutils'

window.customElements.define('app-edit-item', class extends HTMLElement {
  modal?: HTMLElement
  template = ''
  edit (item: Item) {
    console.log('edit', item)
    const locations = item.locations.map(l => `<option value=${l} ${l.toLowerCase() === item.location.toLowerCase() ? 'selected' : ''}>${l}</option>`).join('')
    const boxes = item.boxes.map(b => `<option value="${b}" ${b.toLowerCase() === item.box.toLowerCase() ? 'selected' : ''}>${b}</option>`).join('')
    const statuses = item.statuses.map(s => `<option value="${s}" ${s.toLowerCase() === item.status.toLowerCase() ? 'selected' : ''}>${s}</option>`).join('')
    const drawers = ['', 1, 2, 3, 4, 5, 6, 7].map(d => `<option value="${d}" ${d.toString().toLowerCase() === item.drawer.toLowerCase() ? 'selected' : ''}>${d}</option>`).join('')
    const photo = item.photo === undefined ? '' : item.photo[0].url
    const data = { ...item, photo, statuses, drawers, locations, boxes }
    if (!this.modal) return console.error('no modal')
    this.modal.innerHTML = fillTemplate(this.template, data)
    const printed = this.modal.querySelector('input[name="ref-printed"]') as HTMLInputElement
    printed.checked = data['ref-printed']
    emit('app-modal--edit-item--open')
  }
  async connectedCallback () {
    await sleep(100)
    const modal = document.querySelector<HTMLElement>('.app-modal--edit-item .content')
    if (!modal) return console.error('no modal')
    this.modal = modal
    const template = document.querySelector('template#edit-item')
    if (!template) return console.error('no template')
    this.template = template.innerHTML
    on('edit-item', (item: Item) => this.edit(item))
  }
})
