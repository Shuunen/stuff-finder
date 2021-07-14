import { div, emit, fillTemplate } from 'shuutils'

window.customElements.define('app-print-barcodes', class extends HTMLElement {
  barcodes = []
  wrapper: HTMLDivElement
  openModal () {
    const listElement = document.querySelector('.app-modal--print-barcodes .list')
    if (!listElement) return console.error('failed to find list element')
    const template = document.querySelector('template#print-barcodes-list-item').innerHTML
    console.log('template ?', template)
    const data = { id: 'idd', name: 'nam', brand:'brandz', details: 'dets', reference: 'ref', boxes :'boxesz', drawers: 'draws' }
    console.log('filled ?', fillTemplate(template, data))
    emit('app-modal--print-barcodes--open')
  }
  createWrapper () {
    const icon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><defs/><path fill="currentColor" fill-rule="evenodd" d="M8 4h8v2H8V4zm10 2h4v12h-4v4H6v-4H2V6h4V2h12v4zm2 10h-2v-2H6v2H4V8h16v8zM8 16h8v4H8v-4zm0-6H6v2h2v-2z" clip-rule="evenodd"/></svg>'
    const wrapper = div('app-print-barcodes-trigger transition-colors text-purple-400 hover:text-purple-600 absolute top-5 right-20 h-10 w-10 cursor-pointer', icon)
    wrapper.title = 'Open print barcodes'
    wrapper.addEventListener('click', () => this.openModal())
    return wrapper
  }
  connectedCallback () {
    this.wrapper = this.createWrapper()
    this.parentNode.replaceChild(this.wrapper, this)
  }
})
