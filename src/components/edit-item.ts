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
    /*
    setTimeout(() => this.edit({
      'id': 'recI1hOuhefVKbmNd',
      'name': 'Ventilateur USB Bleu',
      'brand': 'Arctic Breeze',
      'details': 'USB desktop fan',
      'box': 'X',
      'boxes': ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'K', 'M', 'N/A', 'P', 'Q (sock)', 'S', 'T', 'X', 'Z'], 'drawer': '1',
      'location': 'Cuisine',
      'locations': ['', 'N/A', 'Boulot', 'Chambre', 'Cuisine', 'Entrée', 'Garage', 'SDB', 'Salon'],
      'reference': '0872767008984',
      'barcode': '',
      'ref-printed': true,
      'status': 'acheté',
      'statuses': ['', 'acheté', 'défectueux', 'inconnu', 'à donner'],
      'photo': [{ id: 'attaxJugiLEmrGiPP', width: 408, height: 408, url: 'https://dl.airtable.com/.attachments/f85a964b0ee82ee6c7f339e1b58a6c87/52358a66/Arctic_Breeze_Deep_Blue_USB_Fan_AEBRZ00020A_-_Frog.ee.ee', filename: 'Arctic_Breeze_Deep_Blue_USB_Fan_(AEBRZ00020A)_-_Frog.ee.ee', size: 8205, type: 'image/jpeg', thumbnails: { small: { url: 'https://dl.airtable.com/.attachmentThumbnails/6bb6767b1130c1fcd114d2e82fe9a0ac/728600e8', width: 36, height: 36 }, large: { url: 'https://dl.airtable.com/.attachmentThumbnails/fde9f2625b155006a3c94f9ebfc33a22/54d85224', width: 408, height: 408 }, full: { url: 'https://dl.airtable.com/.attachmentThumbnails/bb950bdfad09efbc8a424c33beb154c2/1aa1f3e9', width: 3000, height: 3000 } } }],
      'category': 'Périphérique',
      'updated-on': '2021-06-04T07:40:45.000Z',
    }), 1000)
    */
  }
})
