import { div, dom, emit, image, on, p, pickOne } from 'shuutils'
import { button } from '../utils'

window.customElements.define('app-search-button', class extends HTMLElement {
  search = dom('input', 'search-button px-2 text-lg md:text-base max-w-xs rounded-md shadow-md hover:shadow-lg h-10 w-full border-2 border-purple-500')
  scan = button('Scan it', 'search-button')
  speech = button('Speech', 'search-button')
  hint = p('text-center mt-8 p-4 rounded-md shadow text-lg md:text-base backdrop-filter backdrop-brightness-150 backdrop-opacity-30')
  wrapper = div('app-search-button')

  onStatus (status: string): void {
    let speech = 'Say it'
    let hint = ''
    switch (status) {
    case 'listening':
      this.speech.style.pointerEvents = 'none'
      speech = pickOne(['👂 Listening to you', '👂 Give it to me', '👂 Tell me'])
      hint = 'Say keywords about what you\'re looking for (ex. "tablet", "biking gloves")'
      break
    case 'ready':
      this.speech.style.pointerEvents = 'auto'
      hint = 'Search is ready for you sir, just type your search, scan or say something.'
      break
    case 'settings-required':
      hint = 'You need to configure this app to use it, please use the bouncing setting gear.'
      break
    case 'failed':
      speech = pickOne(['Retry', 'Try again'])
      hint = 'Speech recognition has fail, just press the button to try again or use another method.'
      break
    default:
      console.error('un-expected status :', status)
      hint = 'An un-expected case happen'
    }
    this.speech.textContent = speech
    this.hint.textContent = hint
  }
  handleFocusLessTyping (): void {
    document.body.addEventListener('keydown', event => this.onKeyDown(event))
  }
  onKeyDown (event: KeyboardEvent): void {
    const filter = /^[\s\w-]$/i // this filter let user use special keys like CTRL without interfering
    if (!(event.target instanceof HTMLInputElement)) return
    if (event.target.tagName.toLowerCase() !== 'body' || !filter.test(event.key)) return
    console.log('redirecting user input char :', event.key, 'to search input')
    this.search.focus()
  }
  createInputs (): HTMLDivElement {
    const row = div('grid px-4 sm:grid-cols-3 gap-4 justify-center transition-opacity pointer-events-none opacity-50')
    const colA = div('grid gap-2')
    colA.append(this.scan)
    colA.append(image('icon', 'assets/scan.svg', 'scan'))
    row.append(colA)
    const colB = div('grid gap-2')
    colB.append(this.search)
    colB.append(image('icon', 'assets/keyboard.svg', 'keyboard'))
    row.append(colB)
    const colC = div('grid gap-2')
    colC.append(this.speech)
    colC.append(image('icon', 'assets/mic.svg', 'mic'))
    row.append(colC)
    row.append(dom('style', '', 'input.search-button[placeholder] { text-align: center; } .app-search-button .icon { width: 2rem; margin: auto; opacity: .5; transition: opacity .4s, filter .4s; filter: saturate(0); } .search-button:hover + img { opacity: .8; filter: saturate(1); }'))
    this.search.id = 'input-type'
    this.search.placeholder = 'Type it'
    this.search.addEventListener('change', () => {
      emit('search-start', { str: this.search.value, origin: 'type' } as SearchStartEvent)
      this.search.value = ''
    })
    this.speech.addEventListener('click', () => emit('app-speech--start'))
    this.scan.addEventListener('click', () => emit('app-scan-code--start'))
    return row
  }
  connectedCallback (): void {
    const inputs = this.createInputs()
    this.wrapper.append(inputs)
    this.wrapper.append(this.hint)
    this.parentNode?.replaceChild(this.wrapper, this)
    this.handleFocusLessTyping()
    on('app-status', status => this.onStatus(status))
    on('items-ready', () => {
      inputs.classList.remove('pointer-events-none')
      inputs.classList.remove('opacity-50')
    })
  }
})
