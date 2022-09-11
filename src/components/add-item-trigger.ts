import { div, emit, on } from 'shuutils'

window.customElements.define('app-add-item-trigger', class extends HTMLElement {
  svg = '<svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 64 64"><path d="M32 55.9a23.9 23.9 0 1 1 0-47.8 23.9 23.9 0 0 1 0 47.8zm0-45.2c-11.7 0-21.3 9.6-21.3 21.3S20.3 53.3 32 53.3 53.3 43.7 53.3 32 43.7 10.7 32 10.7z"/><path d="M19.3 30.6h25.4v2.8H19.3z"/><path d="M30.6 19.3h2.8v25.4h-2.8z"/></svg>'
  icon = div('app-add-item absolute top-5 right-32 -mt-0.5 mr-2 hidden h-11 w-11 cursor-pointer text-purple-400 opacity-80 transition-colors hover:text-purple-600 hover:opacity-100', this.svg)
  connectedCallback (): void {
    on('items-ready', () => (this.icon.classList.remove('hidden')))
    if (!this.parentNode) throw new Error('no parentNode for app-add-item-trigger')
    this.parentNode.replaceChild(this.icon, this)
    this.icon.addEventListener('click', () => emit('app-modal--add-item--open'))
  }
})
