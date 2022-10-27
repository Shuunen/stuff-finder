import { emit, fillTemplate, on, readableTimeAgo, sleep, text } from 'shuutils'
import { DEFAULT_IMAGE } from '../constants'
import { showError, showLog } from '../utils'

window.customElements.define('app-search-results', class extends HTMLElement {
  template = ''
  header: HTMLHeadingElement
  list: HTMLDivElement
  input: string
  results: Item[]
  async onResults (event: SearchResultEvent): Promise<void> {
    this.header.textContent = event.title
    this.results = event.results
    this.input = event.input
    this.list.innerHTML = event.results.map(result => {
      const visual = result.photo === undefined ? DEFAULT_IMAGE : result.photo[0].url
      const updated = readableTimeAgo((new Date(result['updated-on'])))
      const data = { barcode: '', brand: '', box: '', drawer: '', ...result, visual, updated }
      return fillTemplate(this.template, data)
    }).join('')
    if (event.results.length === 0) this.list.innerHTML = '<p class="text-center py-4"><span class="text-4xl opacity-50">¯\\_(ツ)_/¯</span><br><br>No results found.</p>'
    this.list.parentElement?.querySelector('.app-add-item')?.remove()
    const content = `Do you want to <a href="#" data-action="app-modal--add-item--open" data-input="${event.input}">add a new item</a> ?`
    this.list.parentElement?.append(text('app-add-item border-t pt-3 text-center', content))
    emit('app-modal--search-results--open')
    await sleep(300)
    if (event.scrollTop) this.list.firstElementChild?.scrollIntoView()
  }
  onSelect (id: string): void {
    const item = this.results.find(item => item.id === id)
    if (!item) return showError('failed to find item with this id : ' + id)
    emit<EditItemEvent>('edit-item', item)
  }
  updateResults (): void {
    showLog('update search results...')
    const origin: SearchOrigin = 'search-results'
    const data = { str: this.input, origin, scrollTop: false }
    emit<SearchStartEvent>('search-start', data)
  }
  connectedCallback (): void {
    on('search-results', (event: SearchResultEvent) => this.onResults(event))
    on<SelectResultEvent>('select-result', (element) => this.onSelect(element.id))
    on('app-modal--edit-item--close', () => this.updateResults())
    const template = document.querySelector('template#search-results-list-item')
    if (!template) return showError('failed to find template#search-results-list-item')
    this.template = template.innerHTML
    const modal = document.querySelector('.app-modal--search-results')
    if (!modal) return showError('failed to find .app-modal--search-results')
    const header = modal.querySelector<HTMLHeadingElement>('.app-header')
    if (!header) return showError('failed to find .app-header')
    this.header = header
    const list = modal.querySelector<HTMLDivElement>('.app-list.app-results')
    if (!list) return showError('failed to find .app-list.app-results')
    this.list = list
  }
})
