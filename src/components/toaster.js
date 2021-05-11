/* global window, HTMLElement */

import { emit, on } from 'shuutils'
import { dom, p } from '../utils.js'

window.customElements.define('app-toaster', class extends HTMLElement {
  show(data) {
    const { type = 'info', message = 'no message provided', delay = 3000 } = data
    const toast = p(message, `toast ${type}`)
    if (type === 'success') toast.innerHTML += '✔️'
    this.append(toast)
    toast.addEventListener('click', () => emit('fade-out-destroy', toast))
    if (type === 'error') return
    setTimeout(() => emit('fade-out-destroy', toast), delay)
  }
  connectedCallback() {
    this.append(dom('style', 'app-toaster { display: flex; flex-direction: column; justify-content: center; align-items: center; bottom: 1rem; position: absolute; width: 100%; z-index: var(--elevation-t-rex, 200); } app-toaster .toast { font-weight: bold; margin: .5rem 0; padding: .2rem .4rem; color: var(--color-white, whitesmoke); background-color: var(--color-primary, chocolate); } app-toaster .toast.error { background-color: var(--color-error, red); color: var(--color-white, whitesmoke); }'))
    on('app-toaster--show', data => this.show(data))
  }
})
