/* global HTMLElement, CustomEvent */

import { pickOne } from 'shuutils'
import { SEARCH_ORIGIN } from '../constants'

class AppSearchButton extends HTMLElement {
  get status () { return this._status }
  set status (status) {
    let label = ''
    let hint = ''
    this._status = status
    switch (status) {
      case 'listening':
        label = pickOne(['👂 Listening to you', '👂 Give it to me', '👂 Tell me'])
        hint = 'Say keywords about what you\'re looking for (ex. "tablet", "biking gloves")'
        break
      case 'ready':
        label = pickOne(['🎙️ Say it'])
        hint = 'Search is ready for you sir, just type your search, scan or say something.'
        break
      case 'no-match':
      case 'failed':
      default:
        label = pickOne(['🎙️ Retry', '🎙️ Try again'])
        hint = 'Speech recognition has fail, just press the button to try again or use another method.'
        break
    }
    this.els.button.textContent = label
    this.els.hint.textContent = hint
  }

  constructor () {
    super()
    this._status = ''
    this.els = {}
    this.on('app-speech--status', status => (this.status = status))
    this.on('items-ready', () => (this.els.wrapper.classList.remove('hidden')))
  }

  emit (eventName, eventData) {
    console.log(`emit event "${eventName}"`, eventData === undefined ? '' : eventData)
    window.dispatchEvent(new CustomEvent(eventName, { detail: eventData }))
  }

  on (eventName, callback) {
    window.addEventListener(eventName, event => callback.bind(this)(event.detail))
  }

  handleFocusLessTyping () {
    document.body.addEventListener('keydown', event => this.onKeyDown(event))
  }

  onKeyDown (event) {
    const filter = /^[\w\d\s-]{1}$/i // this filter let user use special keys like CTRL without interfering
    if (event.target.tagName.toLowerCase() !== 'body' || !filter.test(event.key)) return
    console.log('redirecting user input char :', event.key, 'to search input')
    this.els.search.focus()
  }

  createTypeInput () {
    const search = this.els.search = document.createElement('input')
    search.id = 'input-type'
    search.className = 'input-primary'
    search.placeholder = ' Type it 🔎'
    search.onchange = () => {
      this.emit('search-start', { str: search.value, origin: SEARCH_ORIGIN.type })
      search.value = ''
    }
    return search
  }

  createScanInput () {
    const button = this.els.scan = document.createElement('button')
    button.textContent = '[ Scan it ]'
    button.className = 'input-primary ml1'
    button.style.background = 'linear-gradient(red -30%, white 20%, white 80%, red 130%)'
    button.onclick = () => this.emit('app-scan-code--start')
    return button
  }

  createSeparator () {
    const separator = document.createElement('em')
    separator.className = 'ph1'
    separator.textContent = 'or'
    return separator
  }

  createVoiceInput () {
    const button = this.els.button = document.createElement('button')
    button.className = 'input-primary'
    button.onclick = () => this.emit('app-speech--start')
    return button
  }

  createInputs () {
    const row = document.createElement('div')
    row.className = 'row center middle'
    row.appendChild(this.createTypeInput())
    row.appendChild(this.createScanInput())
    row.appendChild(this.createVoiceInput())
    this.els.search.style = 'width: 6rem'
    return row
  }

  createWrapper () {
    const wrapper = document.createElement('div')
    wrapper.className = 'app-search-button col mt2 hidden'
    wrapper.appendChild(this.createInputs())
    const hint = this.els.hint = document.createElement('p')
    hint.className = 'm1'
    wrapper.appendChild(hint)
    return wrapper
  }

  connectedCallback () {
    this.els.wrapper = this.createWrapper()
    this.status = 'ready'
    this.parentNode.replaceChild(this.els.wrapper, this)
    this.handleFocusLessTyping()
  }
}

window.customElements.define('app-search-button', AppSearchButton)
