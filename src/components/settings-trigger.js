/* global window, HTMLElement */

import { emit, on } from 'shuutils'
import { div, dom } from '../utils.js'

class AppSettingsTrigger extends HTMLElement {
  get style() {
    return `
    .${this._id} { color: var(--color-grey, grey); cursor: pointer; height: 2.5rem; overflow: hidden; position: absolute; right: 2rem; top: 2rem; width: 2.5rem; z-index: var(--elevation-child, 30); }
    .${this._id}.animate { animation-duration: 2s; animation-fill-mode: both; animation-iteration-count: infinite; animation-name: bounce; color: var(--color-primary, steelblue); transform-origin: center bottom; }
    @keyframes bounce{20%,53%,80%,from,to{animation-timing-function:cubic-bezier(.215,.61,.355,1);transform:translate3d(0,0,0)}40%,43%{animation-timing-function:cubic-bezier(.755,.05,.855,.06);transform:translate3d(0,-30px,0)}70%{animation-timing-function:cubic-bezier(.755,.05,.855,.06);transform:translate3d(0,-15px,0)}90%{transform:translate3d(0,-4px,0)}}`
  }

  get icon() {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-settings"> <circle cx="12" cy="12" r="3"></circle> <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>'
  }

  constructor() {
    super()
    this._id = 'app-settings-trigger'
    this.els = {}
    on(`${this._id}--animate`, active => this.animate(active))
  }

  animate(active) {
    this.els.wrapper.classList.toggle('animate', active)
  }

  createWrapper() {
    const wrapper = div(this._id, this.icon)
    wrapper.title = 'Open settings'
    wrapper.addEventListener('click', () => emit('app-modal--settings--open'))
    wrapper.append(dom('style', this.style))
    return wrapper
  }

  connectedCallback() {
    this.els.wrapper = this.createWrapper()
    this.parentNode.replaceChild(this.els.wrapper, this)
  }
}

window.customElements.define('app-settings-trigger', AppSettingsTrigger)
