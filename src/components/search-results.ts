import { emit, fillTemplate, on, readableTimeAgo } from 'shuutils'

window.customElements.define('app-search-results', class extends HTMLElement {
  template = ''
  header: HTMLHeadingElement
  list: HTMLDivElement
  results: Item[]
  onResults (data: { title: string, results: Item[], byReference: boolean }) {
    this.header.textContent = data.title
    this.results = data.results
    this.list.innerHTML = data.results.map(result => {
      const visual = result.photo === undefined ? 'assets/no-visual.svg' : result.photo[0].url
      const updated = readableTimeAgo((new Date(result['updated-on'])))
      const data = { ...result, visual, updated }
      return fillTemplate(this.template, data)
    }).join('')
    emit('app-modal--search-results--open')
  }
    if (!item) return showError('failed to find item with this id : ' + id)
    emit('edit-item', item)
  }
  connectedCallback () {
    on('search-results', (data) => this.onResults(data))
    on('select-result', (element) => this.onSelect(element.id))
    this.template = document.querySelector('template#search-results-list-item').innerHTML
    const modal = document.querySelector('.app-modal--search-results')
    this.header = modal.querySelector('.header')
    this.list = modal.querySelector('.list.results')
  }
})
