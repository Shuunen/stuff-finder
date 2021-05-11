/* global window, HTMLElement */

import { emit, on } from 'shuutils'
import { div, dom } from '../utils.js'

class AppModal extends HTMLElement {
  get style() {
    return `.${this._id} { background-color: var(--color-white, whitesmoke); border: .3rem solid var(--color-primary, steelblue); border-radius: var(--border-radius, .3rem); max-height: 90%; max-width: 70rem; overflow: auto; z-index: var(--elevation-giraffe, 100); }`
  }

  get name() {
    return this.getAttribute('name')
  }

  constructor() {
    super()
    this._id = `app-modal--${this.name}`
    this.els = {}
    on(`${this._id}--open`, () => this.open())
    on(`${this._id}--close`, () => this.close())
    on('app-modal--close', () => this.close())
  }

  open() {
    this.els.wrapper.classList.remove('hidden')
  }

  close() {
    if (this.els.wrapper.classList.contains('hidden')) return // this.warn('cannot close an already hidden modal')
    emit(`${this._id}--closed`)
    emit('fade-out', this.els.wrapper)
  }

  createWrapper() {
    const wrapper = div('backdrop hidden')
    wrapper.addEventListener('click', () => emit('app-modal--close'))
    wrapper.append(dom('style', this.style))
    return wrapper
  }

  createModal() {
    const modal = div(`${this._id} col`)
    modal.addEventListener('click', event => event.stopPropagation())
    return modal
  }

  connectedCallback() {
    this.els.wrapper = this.createWrapper()
    this.els.modal = this.createModal()
    this.els.modal.innerHTML = this.innerHTML
    this.els.wrapper.append(this.els.modal)
    this.parentNode.replaceChild(this.els.wrapper, this)
    emit(`${this._id}--ready`)
  }
}

setTimeout(() => window.customElements.define('app-modal', AppModal), 10)
