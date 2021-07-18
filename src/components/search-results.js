import { div, dom, emit, h2, on, pickOne, sleep } from 'shuutils'
import { button } from '../utils'

class AppSearchResults extends HTMLElement {
  constructor () {
    super()
    this.els = {}
    on('app-search-results--show', data => this.show(data))
    on('app-search-results--retry', () => this.retry())
    on('app-search-results--edit', active => this.toggleFooter(active))
  }

  show (data) {
    console.log(`displaying ${data.results.length} results...`)
    if (data.byReference && !data.results[0]['ref-printed']) this.markReferenceAsPrinted(data.results[0])
    this.els.title.textContent = data.results.length === 1 ? '' : data.title
    this.format(data.results)
    emit('app-modal--search-results--open')
  }

  markReferenceAsPrinted (item) {
    console.log('marking this item as ref-printed', item)
    emit('app-update--item', { 'id': item.id, 'ref-printed': true })
  }

  retry () {
    emit('app-modal--search-results--close')
    emit('search-retry')
  }

  async format (results) {
    const content = results.length === 0 ? `<div class="mb1 mt1"><span class="highlight-grey">${this.sorryAscii()}</span></div><span class="mb1">Sorry nothing was found.</span>` : ''
    this.els.results.innerHTML = content
    if (content.length > 0) return
    results.forEach(result => {
      const resultElement = dom('app-search-result')
      resultElement.setAttribute('data', JSON.stringify(result))
      if (results.length === 1) resultElement.setAttribute('solo', true)
      this.els.results.append(resultElement)
    })
    await sleep(100)
    this.els.results.scrollTo(0, 0)
  }

  sorryAscii () {
    return pickOne(['[#´Д`]', '¯\\_(ツ)_/¯', 'ಠ_ಠ', '(⊙＿⊙\')', '(#+_+)', '(._.)', '(╯▅╰)', '╮ (. ❛ ᴗ ❛.) ╭'])
  }

  createWrapper () {
    const wrapper = dom('app-modal')
    wrapper.name = 'search-results'
    return wrapper
  }

  addContent () {
    this.els.wrapper = document.querySelector('.app-modal--search-results')
    this.els.title = h2('def')
    this.els.wrapper.append(this.els.title)
    this.els.results = div('list')
    this.els.wrapper.append(this.els.results)
    this.els.footer = div('row center mb1 mt1')
    const close = button('&times; Close')
    close.addEventListener('click', () => emit('app-modal--close'))
    this.els.footer.append(close)
    this.els.retry = button('Retry &check;', 'ml1')
    this.els.retry.addEventListener('click', () => emit('app-search-results--retry', this.data))
    this.els.footer.append(this.els.retry)
    this.els.wrapper.append(this.els.footer)
    emit('app-search-results--ready')
  }

  toggleFooter (active) {
    this.els.footer.classList.toggle('hidden', active)
  }

  connectedCallback () {
    const wrapper = this.createWrapper()
    this.parentNode.replaceChild(wrapper, this)
    on('app-modal--search-results--ready', () => this.addContent())
  }
}

window.customElements.define('app-search-results', AppSearchResults)
