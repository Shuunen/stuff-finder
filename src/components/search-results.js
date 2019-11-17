/* global HTMLElement, CustomEvent */

import { pickOne } from 'shuutils'

class AppSearchResults extends HTMLElement {
  get style () {
    return `
    .box.highlight-grey {
      font-family: Arial, monospace;
      letter-spacing: 0.1rem;
      padding: 0.1rem 0.4rem;
      border-width: 0.1rem;
      border-style: outset;
      border-radius: 0.3rem;
    }
    .bold .box {
      font-size: 1.2rem;
    }
   `
  }

  constructor () {
    super()
    this._id = 'app-search-results'
    this.els = {}
    this.on(`${this._id}--show`, this.show)
    this.on(`${this._id}--retry`, this.retry)
  }

  emit (eventName, eventData) {
    console.log(`emit event "${eventName}"`, eventData === undefined ? '' : eventData)
    window.dispatchEvent(new CustomEvent(eventName, { detail: eventData }))
  }

  on (eventName, callback) {
    window.addEventListener(eventName, event => callback.bind(this)(event.detail))
  }

  show (data) {
    console.log(`displaying ${data.results.length} results...`)
    this.els.title.textContent = data.title
    this.format(data.results)
    this.emit('app-modal--search-results--open')
  }

  retry () {
    this.emit('app-modal--search-results--close')
    this.emit('app-speech--start')
  }

  format (results) {
    if (results.length === 0) {
      this.els.results.innerHTML = `<div class="mb1 mt1"><span class="highlight-grey">${this.sorryAscii()}</span></div><span class="mb1">Sorry nothing was found.</span>`
      return
    }
    const locations = []
    const resultsPerLocation = {}
    results.forEach(result => {
      if (!locations.includes(result.location)) {
        locations.push(result.location)
      }
      if (!resultsPerLocation[result.location]) {
        resultsPerLocation[result.location] = []
      }
      resultsPerLocation[result.location].push(result)
    })
    this.els.results.innerHTML = ''
    locations.forEach(location => {
      const group = document.createElement('fieldset')
      group.className = 'mb1 auto'
      const label = document.createElement('legend')
      label.className = 'ph1'
      label.textContent = location || 'Somewhere'
      group.appendChild(label)
      resultsPerLocation[location].forEach(result => {
        const resultEl = document.createElement('app-search-result')
        resultEl.setAttribute('data', JSON.stringify(result))
        group.appendChild(resultEl)
      })
      this.els.results.appendChild(group)
    })
  }

  sorryAscii () {
    return pickOne(['[#´Д`]', '¯\\_(ツ)_/¯', 'ಠ_ಠ', '(⊙＿⊙\')', '(#+_+)', '(._.)', '(╯▅╰)', '╮ (. ❛ ᴗ ❛.) ╭'])
  }

  createWrapper () {
    const wrapper = document.createElement('app-modal')
    wrapper.name = 'search-results'
    const style = document.createElement('style')
    style.innerHTML = this.style
    wrapper.appendChild(style)
    return wrapper
  }

  addContent () {
    const title = document.createElement('h2')
    title.textContent = 'def'
    this.els.wrapper.appendChild(title)
    this.els.title = title
    const results = document.createElement('div')
    results.className = 'col middle mts'
    this.els.wrapper.appendChild(results)
    this.els.results = results
  }

  addFooter () {
    const row = document.createElement('div')
    row.className = 'row center mvs'
    const close = document.createElement('button')
    close.innerHTML = '&times; Close'
    close.onclick = () => this.emit('app-modal--close')
    row.appendChild(close)
    const retry = document.createElement('button')
    retry.innerHTML = 'Retry &check;'
    retry.onclick = () => this.emit(`${this._id}--retry`, this.data)
    row.appendChild(retry)
    this.els.retry = retry
    this.els.wrapper.appendChild(row)
  }

  connectedCallback () {
    const wrapper = this.createWrapper()
    this.parentNode.replaceChild(wrapper, this)
    setTimeout(() => {
      this.els.wrapper = document.querySelector('.app-modal--search-results')
      this.addContent()
      this.addFooter()
    }, 500)
  }
}

window.customElements.define('app-search-results', AppSearchResults)
