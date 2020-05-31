/* global HTMLElement, CustomEvent */

import { pickOne } from 'shuutils'

class AppSearchResults extends HTMLElement {
  constructor () {
    super()
    this.els = {}
    this.on('app-search-results--show', this.show)
    this.on('app-search-results--retry', this.retry)
    this.on('app-search-results--edit', this.toggleFooter)
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
    if (data.byReference && !data.results[0]['ref-printed']) this.markReferenceAsPrinted(data.results[0])
    this.els.title.textContent = data.results.length > 1 ? data.title : ''
    this.format(data.results)
    this.emit('app-modal--search-results--open')
  }

  markReferenceAsPrinted (item) {
    console.log('marking this item as ref-printed', item)
    this.emit('app-update--item', { id: item.id, 'ref-printed': true })
  }

  retry () {
    this.emit('app-modal--search-results--close')
    this.emit('app-speech--start')
  }

  scanLocations (results) {
    const locations = []
    const resultsPerLocation = {}
    results.forEach(result => {
      const location = (result.location && result.location !== 'N/A') ? result.location : ''
      if (!locations.includes(location)) {
        locations.push(location)
      }
      if (!resultsPerLocation[location]) {
        resultsPerLocation[location] = []
      }
      resultsPerLocation[location].push(result)
    })
    return { locations, resultsPerLocation }
  }

  format (results) {
    if (results.length === 0) {
      this.els.results.innerHTML = `<div class="mb1 mt1"><span class="highlight-grey">${this.sorryAscii()}</span></div><span class="mb1">Sorry nothing was found.</span>`
      return
    }
    const { locations, resultsPerLocation } = this.scanLocations(results)
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
        if (results.length === 1) resultEl.setAttribute('solo', true)
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
    retry.onclick = () => this.emit('app-search-results--retry', this.data)
    row.appendChild(retry)
    this.els.retry = retry
    this.els.footer = row
    this.els.wrapper.appendChild(this.els.footer)
  }

  toggleFooter () {
    this.els.footer.classList.toggle('hidden')
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
