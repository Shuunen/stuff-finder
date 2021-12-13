import { emit, fillTemplate, on, readableTimeAgo, sleep, text } from 'shuutils'
import { DEFAULT_IMAGE, SEARCH_ORIGIN } from '../constants'
import { showError, showLog } from '../utils'

window.customElements.define('app-search-results', class extends HTMLElement {
  template = ''
  header: HTMLHeadingElement
  list: HTMLDivElement
  input: string
  results: Item[]
  async onResults (data: SearchResultEvent) {
    this.header.textContent = data.title
    this.results = data.results
    this.input = data.input
    this.list.innerHTML = data.results.map(result => {
      const visual = result.photo === undefined ? DEFAULT_IMAGE : result.photo[0].url
      const updated = readableTimeAgo((new Date(result['updated-on'])))
      const data = { barcode: '', drawer: '', ...result, visual, updated }
      return fillTemplate(this.template, data)
    }).join('')
    if (data.results.length === 0) this.list.innerHTML = '<p class="text-center py-4"><span class="text-4xl opacity-50">¯\\_(ツ)_/¯</span><br><br>No results found.</p>'
    this.list.parentElement.querySelector('.add-item')?.remove()
    this.list.parentElement.append(text('add-item text-center pt-3 border-t', `Do you want to <a href="#" data-action="app-modal--add-item--open" data-input="${data.input}">add a new item</a> ?`))
    emit('app-modal--search-results--open')
    await sleep(300)
    this.list.firstElementChild.scrollIntoView()
  }
  onSelect (id: string) {
    const item = this.results.find(item => item.id === id)
    if (!item) return showError('failed to find item with this id : ' + id)
    emit('edit-item', item)
  }
  updateResults () {
    showLog('update search results...')
    emit('search-start', { str: this.input, origin: SEARCH_ORIGIN.searchResults })
  }
  connectedCallback () {
    on('search-results', (data: SearchResultEvent) => this.onResults(data))
    on('select-result', (element) => this.onSelect(element.id))
    on('app-modal--edit-item--close', () => this.updateResults())
    this.template = document.querySelector('template#search-results-list-item').innerHTML
    const modal = document.querySelector('.app-modal--search-results')
    this.header = modal.querySelector('.header')
    this.list = modal.querySelector('.list.results')
  }
})
