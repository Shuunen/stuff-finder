/* global window, HTMLElement */

import { on } from 'shuutils'
import { div, dom } from '../utils.js'

class AppLoader extends HTMLElement {
  get style() {
    return `
    .app-loader { z-index: var(--elevation-t-rex, 200); }
    .app-loader .lds-dual-ring { display: inline-block; height: 6rem; width: 6rem; }
    .app-loader .lds-dual-ring:after { animation: lds-dual-ring 1.2s linear infinite; border: .5rem solid var(--color-white, whitesmoke); border-color: var(--color-white, whitesmoke) transparent var(--color-white, whitesmoke) transparent; border-radius: 50%; content: " "; display: block; height: 5rem; width: 5rem; }
    @keyframes lds-dual-ring { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`
  }

  constructor() {
    super()
    this._id = 'app-loader'
    this.els = {}
    on(`${this._id}--toggle`, active => this.toggle(active))
  }

  toggle(active) {
    this.els.wrapper.classList.toggle('hidden', !active)
  }

  createWrapper() {
    const wrapper = div(`${this._id} backdrop hidden`, '<div class="lds-dual-ring">.</div>')
    wrapper.append(dom('style', this.style))
    return wrapper
  }

  connectedCallback() {
    this.els.wrapper = this.createWrapper()
    this.parentNode.replaceChild(this.els.wrapper, this)
  }
}

window.customElements.define('app-loader', AppLoader)
