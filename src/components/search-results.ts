import { div, emit, fillTemplate, h1, on, readableTimeAgo, sleep, text } from 'shuutils'
import { DEFAULT_IMAGE } from '../constants'
import { find, logger } from '../utils'

window.customElements.define('app-search-results', class extends HTMLElement {
  template = ''
  header = h1('')
  list = div('')
  input = ''
  results: Item[] = []
  async onResults (event: SearchResultsEvent): Promise<void> {
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
    if (this.list.parentElement) find.oneOrNone('.app-add-item', this.list.parentElement)?.remove()
    const content = `Do you want to <a href="#" data-action="app-modal--add-item--open" data-input="${event.input}">add a new item</a> ?`
    this.list.parentElement?.append(text('app-add-item border-t pt-3 text-center', content))
    emit<AppModalSearchResultsOpenEvent>('app-modal--search-results--open')
    await sleep(300)
    if (event.scrollTop) this.list.firstElementChild?.scrollIntoView()
  }
  onSelect (id: string): void {
    const item = this.results.find(item => item.id === id)
    if (!item) return logger.showError('failed to find item with this id : ' + id)
    emit<EditItemEvent>('edit-item', item)
  }
  updateResults (): void {
    logger.showLog('update search results...')
    const origin: SearchOrigin = 'search-results'
    const data = { str: this.input, origin, scrollTop: false }
    emit<SearchStartEvent>('search-start', data)
  }
  connectedCallback (): void {
    on<SearchResultsEvent>('search-results', this.onResults.bind(this))
    on<SelectResultEvent>('select-result', this.onSelect.bind(this))
    // on<AppModalEditItemCloseEvent>('app-modal--edit-item--close', this.updateResults.bind(this)) // TODO avoid refreshing every time
    this.template = find.one('template#search-results-list-item').innerHTML
    const modal = find.one<HTMLDivElement>('.app-modal--search-results')
    this.header = find.one<HTMLHeadingElement>('.app-header', modal)
    this.list = find.one<HTMLDivElement>('.app-list.app-results', modal)
  }
})
