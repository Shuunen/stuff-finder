/* global HTMLElement */

import { type } from '@camwiegert/typical'

class AppPrompter extends HTMLElement {
  constructor () {
    super()
    this._id = 'app-prompter'
    this.els = {}
    this.on(`${this._id}--type`, args => type(this.els.wrapper, ...args))
  }

  on (eventName, callback) {
    window.addEventListener(eventName, event => callback.bind(this)(event.detail))
  }

  createWrapper () {
    const wrapper = document.createElement('h1')
    wrapper.className = `${this._id} highlight`
    return wrapper
  }

  connectedCallback () {
    this.els.wrapper = this.createWrapper()
    this.parentNode.replaceChild(this.els.wrapper, this)
  }
}

window.customElements.define('app-prompter', AppPrompter)
