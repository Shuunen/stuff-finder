/* global window, HTMLElement */

import { type } from '@camwiegert/typical'
import { on } from 'shuutils'
import { dom } from '../utils.js'

class AppPrompter extends HTMLElement {
  constructor() {
    super()
    this._id = 'app-prompter'
    this.els = {}
    on(`${this._id}--type`, options => type(this.els.wrapper, ...options))
  }

  createWrapper() {
    const wrapper = dom('h1', '', `${this._id} highlight`)
    return wrapper
  }

  connectedCallback() {
    this.els.wrapper = this.createWrapper()
    this.parentNode.replaceChild(this.els.wrapper, this)
  }
}

window.customElements.define('app-prompter', AppPrompter)
