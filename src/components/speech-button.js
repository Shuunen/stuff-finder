import { pickOne } from 'shuutils'

class AppSpeechButton extends HTMLElement {
  set status (status) {
    let label = ''
    let hint = ''
    switch (status) {
      case 'listening':
        label = pickOne(['👂 Listening to you', '👂 Give it to me', '👂 Tell me'])
        hint = 'Say keywords about what you\'re looking for (ex. "tablet", "biking gloves")'
        break
      case 'ready':
        label = pickOne(['🔎 Search', '🔎 Find something', '🔎 Find'])
        hint = 'Search is ready for you sir, just press the button and say something.'
        break
      case 'no-match':
      case 'failed':
      default:
        label = pickOne(['🔎 Retry', '🔎 Try again'])
        hint = 'Search has fail, just press the button to try again.'
        break
    }
    this.els.button.textContent = label
    this.els.hint.textContent = hint
  }

  constructor () {
    super()
    this._id = 'app-speech-button'
    this.els = {}
    this.on('app-speech--status', status => (this.status = status))
  }

  emit (eventName, eventData) {
    console.log(`emit event "${eventName}"`, eventData === undefined ? '' : eventData)
    window.dispatchEvent(new CustomEvent(eventName, { detail: eventData }))
  }

  on (eventName, callback) {
    window.addEventListener(eventName, event => callback.bind(this)(event.detail))
  }

  createWrapper () {
    const wrapper = document.createElement('div')
    wrapper.className = `${this._id} col mt2`
    const row = document.createElement('div')
    row.className = 'row center'
    const button = this.els.button = document.createElement('button')
    button.className = 'big'
    button.onclick = () => this.emit('app-speech--start')
    button.textContent = '🔎 Search'
    row.appendChild(button)
    wrapper.appendChild(row)
    const hint = this.els.hint = document.createElement('small')
    hint.className = 'm1'
    wrapper.appendChild(hint)
    return wrapper
  }

  connectedCallback () {
    this.els.wrapper = this.createWrapper()
    this.status = 'ready'
    this.parentNode.replaceChild(this.els.wrapper, this)
  }
}

window.customElements.define('app-speech-button', AppSpeechButton)
