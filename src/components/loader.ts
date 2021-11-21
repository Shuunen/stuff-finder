import { div, on } from 'shuutils'

window.customElements.define('app-loader', class extends HTMLElement {
  wrapper = div('app-loader animate-spin opacity-50 h-24 w-24 z-50 fixed', '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><defs/><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0A12 12 0 000 12h4zm2 5.3A8 8 0 014 12H0c0 3 1.1 5.8 3 8l3-2.7z" class="opacity-75"/></svg>')
  connectedCallback () {
    on('app-loader--toggle', active => this.wrapper.classList.toggle('hidden', !active))
    this.parentNode.replaceChild(this.wrapper, this)
  }
})
