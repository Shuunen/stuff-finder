import { div, emit, fillTemplate, h1, on, readableTimeAgo, sleep, text } from 'shuutils'
import { defaultImage, delays, emptyItem } from '../constants'
import { ItemField, type AppModalSearchResultsOpenEvent, type EditItemEvent, type Item, type SearchResultsEvent, type SelectResultEvent } from '../types'
import { find } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'

window.customElements.define('app-search-results', class extends HTMLElement {

  private template = ''

  private header = h1('')

  private list = div('')

  private results: Item[] = []

  public connectedCallback () {
    on<SearchResultsEvent>('search-results', this.onResults.bind(this))
    on<SelectResultEvent>('select-result', this.onSelect.bind(this))
    this.template = find.one('template#search-results-list-item').innerHTML
    const modal = find.one<HTMLDivElement>('.app-modal--search-results')
    this.header = find.one<HTMLHeadingElement>('.app-header', modal)
    this.list = find.one<HTMLDivElement>('.app-list.app-results', modal)
  }

  private onSelect (id: string) {
    const item = this.results.find(anItem => anItem.id === id)
    if (!item) { logger.showError(`failed to find item with this id : ${id}`); return }
    emit<EditItemEvent>('edit-item', item)
  }

  private async onResults (event: SearchResultsEvent) {
    this.header.textContent = event.title
    this.results = event.results
    // eslint-disable-next-line no-unsanitized/property
    this.list.innerHTML = event.results.map(result => {
      const visual = result.photo?.[0]?.url ?? defaultImage
      const updated = readableTimeAgo(new Date(result[ItemField.UpdatedOn]))
      const data = { ...emptyItem, ...result, visual, updated }
      return fillTemplate(this.template, data)
    }).join('')
    if (event.results.length === 0) this.list.innerHTML = '<p class="text-center py-4"><span class="text-4xl opacity-50">¯\\_(ツ)_/¯</span><br><br>No results found.</p>'
    if (this.list.parentElement) find.oneOrNone('.app-add-item', this.list.parentElement)?.remove()
    const content = `Do you want to <a href="#" data-action="app-modal--add-item--open" data-input="${event.input}">add a new item</a> ?`
    this.list.parentElement?.append(text('app-add-item border-t pt-3 text-center', content))
    emit<AppModalSearchResultsOpenEvent>('app-modal--search-results--open')
    await sleep(delays.large)
    if (event.willScrollTop) this.list.firstElementChild?.scrollIntoView()
  }

  
})
