import { div, dom, emit, image, on, pickOne, text, tw } from 'shuutils'
import type { AppScanCodeStartEvent, AppSpeechStartEvent, AppStatusEvent, ItemsReadyEvent, SearchStartEvent } from '../types/events.types'
import type { AppStatus } from '../types/status.types'
import { button } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'

const knownSpeechAndHints: Record<AppStatus, { hint: string; speech: string }> = {
  'failed': {
    hint: 'Speech recognition has fail, just press the button to try again or use another method.',
    speech: pickOne(['Retry', 'Try again']) ?? 'One more time',
  },
  'listening': {
    hint: 'Say keywords about what you\'re looking for (ex. "tablet", "biking gloves")',
    speech: pickOne(['👂 Listening to you', '👂 Give it to me']) ?? '👂 Tell me',
  },
  'loading': {
    hint: 'Loading...',
    speech: 'Loading',
  },
  'ready': {
    hint: 'Search is ready for you sir, just type your search, scan or say something.',
    speech: pickOne(['Say it', 'Speech']) ?? 'Just say it',
  },
  'settings-required': {
    hint: 'You need to configure this app to use it, please use the bouncing setting gear.',
    speech: 'Settings',
  },
  'unexpected-error': {
    hint: 'An unexpected error has occurred, please try again later.',
    speech: 'Unexpected error',
  },
}

const speechAndHints: Record<string, { hint: string; speech: string }> = {
  ...knownSpeechAndHints,
}

window.customElements.define('app-search-button', class extends HTMLElement {

  private readonly search = dom('input', tw('app-search-button h-10 w-full max-w-xs rounded-md border-2 border-purple-500 px-2 text-lg shadow-md hover:shadow-lg md:text-base'))

  private readonly scan = button('Scan it', tw('app-search-button'))

  private readonly speech = button('Speech', tw('app-search-button'))

  private readonly hint = text('mt-8 rounded-md p-4 text-center text-lg shadow backdrop-brightness-150 backdrop-opacity-30 md:text-base')

  private readonly wrapper = div('app-search-button')

  public connectedCallback () {
    const inputs = this.createInputs()
    this.wrapper.append(inputs)
    this.wrapper.append(this.hint)
    if (!this.parentNode) throw new Error('no parentNode for app-search-button')
    this.parentNode.replaceChild(this.wrapper, this)
    this.handleFocusLessTyping()
    on<AppStatusEvent>('app-status', this.onStatus.bind(this))
    on<ItemsReadyEvent>('items-ready', () => {
      inputs.classList.remove('pointer-events-none')
      inputs.classList.remove('opacity-50')
    })
  }

  private onStatus (status: AppStatus) {
    const { hint, speech } = this.getSpeechAndHint(status)
    this.speech.textContent = speech
    this.hint.textContent = hint
  }

  private getSpeechAndHint (status: string) {
    if (status === 'listening') this.speech.style.pointerEvents = 'none'
    if (status === 'ready') this.speech.style.pointerEvents = 'auto'
    return speechAndHints[status] ?? knownSpeechAndHints['unexpected-error']
  }

  private handleFocusLessTyping () {
    document.body.addEventListener('keydown', event => { this.onKeyDown(event) })
  }

  private onKeyDown (event: KeyboardEvent) {
    const filter = /^[\s\w-]$/u // this filter let user use special keys like CTRL without interfering
    if (!(event.target instanceof HTMLInputElement)) return
    if (event.target.tagName.toLowerCase() !== 'body' || !filter.test(event.key)) return
    logger.info('redirecting user input char :', event.key, 'to search input')
    this.search.focus()
  }

  // eslint-disable-next-line max-statements
  private createInputs () {
    const row = div('pointer-events-none grid justify-center gap-4 px-4 opacity-50 transition-opacity sm:grid-cols-3')
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
    row.append(dom('style', '', 'input.app-search-button[placeholder] { text-align: center; } .app-search-button .icon { width: 2rem; margin: auto; opacity: .5; transition: opacity .4s, .4s; filter: saturate(0); } .app-search-button:hover + img { opacity: .8; filter: saturate(1); }'))
    this.search.id = 'input-type'
    this.search.placeholder = 'Type it'
    this.search.addEventListener('change', () => {
      emit<SearchStartEvent>('search-start', { origin: 'type', str: this.search.value })
      this.search.value = ''
    })
    this.speech.addEventListener('click', () => emit<AppSpeechStartEvent>('app-speech--start'))
    this.scan.addEventListener('click', () => emit<AppScanCodeStartEvent>('app-scan-code--start'))
    return row
  }
})
