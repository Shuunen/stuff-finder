import { emit, on, pickOne } from 'shuutils'
import { SEARCH_ORIGIN } from '../constants.js'
import { button, div, dom, p } from '../utils.js'

class AppSearchButton extends HTMLElement {
  get status () {
    return this._status
  }

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
    on('app-speech--status', status => {
      this.status = status
    })
    on('items-ready', () => {
      this.els.wrapper.classList.remove('hidden')
    })
  }

  handleFocusLessTyping () {
    document.body.addEventListener('keydown', event => this.onKeyDown(event))
  }

  onKeyDown (event) {
    const filter = /^[\s\w-]$/i // this filter let user use special keys like CTRL without interfering
    if (event.target.tagName.toLowerCase() !== 'body' || !filter.test(event.key)) return
    console.log('redirecting user input char :', event.key, 'to search input')
    this.els.search.focus()
  }

  createTypeInput () {
    const search = dom('input')
    search.id = 'input-type'
    search.className = 'input-primary'
    search.placeholder = ' Type it 🔎'
    search.addEventListener('change', () => {
      emit('search-start', { str: search.value, origin: SEARCH_ORIGIN.type })
      search.value = ''
    })
    this.els.search = search
    return search
  }

  createScanInput () {
    this.els.scan = button('[ Scan it ]', 'input-primary')
    this.els.scan.style.background = 'linear-gradient(red -30%, white 20%, white 80%, red 130%)'
    this.els.scan.addEventListener('click', () => emit('app-scan-code--start'))
    return this.els.scan
  }

  createVoiceInput () {
    this.els.button = button('', 'input-primary')
    this.els.button.addEventListener('click', () => emit('app-speech--start'))
    return this.els.button
  }

  createInputs () {
    const row = div('grid col-3 center')
    row.append(this.createTypeInput())
    row.append(this.createScanInput())
    row.append(this.createVoiceInput())
    return row
  }

  createWrapper () {
    const wrapper = div('app-search-button col mt2 ph1 hidden')
    wrapper.append(this.createInputs())
    this.els.hint = p('', 'm1')
    wrapper.append(this.els.hint)
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
