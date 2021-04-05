/* global window, HTMLElement */

import { emit, on } from 'shuutils'
import { div, dom, p } from '../utils.js'

class AppToaster extends HTMLElement {
  get style() {
    return `
    .app-toaster { bottom: 1rem; position: absolute; width: 100%; z-index: var(--elevation-t-rex, 200); }
    .app-toaster .toast { font-weight: bold; margin: .5rem 0; padding: .2rem .4rem; color: var(--color-white, whitesmoke); background-color: var(--color-primary, chocolate); }
    .app-toaster .toast.error { background-color: var(--color-error, red); color: var(--color-white, whitesmoke); }`
  }

  constructor() {
    super()
    this._id = 'app-toaster'
    this.els = {}
    on(`${this._id}--show`, data => this.show(data))
  }

  show(data) {
    const { type = 'info', message = 'no message provided', delay = 3000 } = data
    const toast = p(message, `toast ${type}`)
    if (type === 'success') toast.innerHTML += '✔️'
    this.els.wrapper.append(toast)
    toast.addEventListener('click', () => emit('fade-out-destroy', toast))
    if (type === 'error') return
    setTimeout(() => emit('fade-out', toast), delay)
  }

  createWrapper() {
    const wrapper = div(`${this._id} col center`)
    wrapper.append(dom('style', this.style))
    return wrapper
  }

  connectedCallback() {
    this.els.wrapper = this.createWrapper()
    this.parentNode.replaceChild(this.els.wrapper, this)
  }
}

window.customElements.define('app-toaster', AppToaster)
