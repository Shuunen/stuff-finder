import { div, dom, emit, image, on, p, pickOne } from 'shuutils'
import { SEARCH_ORIGIN } from '../constants.js'
import { button } from '../utils'

window.customElements.define('app-search-button', class extends HTMLElement {
  search = dom('input', 'px-2 rounded-md shadow-md h-10 w-full border-2 border-purple-500')
  scan = button('Scan it', 'h-10')
  speech = button('Speech', 'h-10')
  hint = p('text-center mt-8')
  wrapper = div('app-search-button col mt2 ph1')

  onStatus (status) {
    let label = ''
    let hint = ''
    switch (status) {
    case 'listening':
      label = pickOne(['👂 Listening to you', '👂 Give it to me', '👂 Tell me'])
      hint = 'Say keywords about what you\'re looking for (ex. "tablet", "biking gloves")'
      break
    case 'ready':
      label = 'Say it'
      hint = 'Search is ready for you sir, just type your search, scan or say something.'
      break
    case 'no-match':
    case 'failed':
    default:
      label = pickOne(['Retry', 'Try again'])
      hint = 'Speech recognition has fail, just press the button to try again or use another method.'
      break
    }
    this.speech.textContent = label
    this.hint.textContent = hint
  }

  handleFocusLessTyping () {
    document.body.addEventListener('keydown', event => this.onKeyDown(event))
  }

  onKeyDown (event) {
    const filter = /^[\s\w-]$/i // this filter let user use special keys like CTRL without interfering
    if (event.target.tagName.toLowerCase() !== 'body' || !filter.test(event.key)) return
    console.log('redirecting user input char :', event.key, 'to search input')
    this.search.focus()
  }

  createInputs () {
    const row = div('grid px-4 md:grid-cols-3 gap-4 max-w-xl')
    const colA = div('grid gap-2')
    colA.append(this.scan)
    colA.append(image('icon', 'assets/scan.svg', 'scan'))
    row.append(colA)
    const colB = div('grid gap-2')
    colB.append(this.search)
    colB.append(image('icon', 'assets/pen.svg', 'pen'))
    row.append(colB)
    const colC = div('grid gap-2')
    colC.append(this.speech)
    colC.append(image('icon', 'assets/mic.svg', 'mic'))
    row.append(colC)
    row.append(dom('style', '', 'input[placeholder] { text-align: center; } .app-search-button .icon { height: 2.5rem; margin: auto; opacity: .5; }'))
    this.search.id = 'input-type'
    this.search.placeholder = 'Type it'
    this.search.addEventListener('change', () => {
      emit('search-start', { str: this.search.value, origin: SEARCH_ORIGIN.type })
      this.search.value = ''
    })
    this.speech.addEventListener('click', () => emit('app-speech--start'))
    this.scan.addEventListener('click', () => emit('app-scan-code--start'))
    return row
  }


  connectedCallback () {
    on('app-speech--status', status => this.onStatus(status))
    this.wrapper.append(this.createInputs())
    this.wrapper.append(this.hint)
    this.onStatus('ready')
    this.parentNode.replaceChild(this.wrapper, this)
    this.handleFocusLessTyping()
  }
})
