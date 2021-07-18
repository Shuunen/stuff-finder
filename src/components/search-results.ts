import { emit, fillTemplate, on } from 'shuutils'
import { Item } from '../types/item'

window.customElements.define('app-search-results', class extends HTMLElement {
  template = ''
  header: HTMLHeadingElement
  list: HTMLDivElement
  onResults (data: { title: string, results: Item[], byReference: boolean }) {
    this.header.textContent = data.title
    this.list.innerHTML = data.results.map(result => {
      const visual = result.photo === undefined ? 'assets/no-visual.svg' : result.photo[0].url
      const data = { ...result, visual }
      return fillTemplate(this.template, data)
    }).join('')
    emit('app-modal--search-results--open')
  }
  connectedCallback () {
    on('search-results', (data) => this.onResults(data))
    this.template = document.querySelector('template#search-results-list-item').innerHTML
    const modal = document.querySelector('.app-modal--search-results')
    this.header = modal.querySelector('.header')
    this.list = modal.querySelector('.list.results')
  }
})
