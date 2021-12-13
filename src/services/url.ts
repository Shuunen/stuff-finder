import { emit, on, sleep } from 'shuutils'
import { SEARCH_ORIGIN } from '../constants'

class UrlService {
  constructor () {
    on('items-ready', () => this.check())
  }
  async check () {
    await sleep(100) // needed
    const parameters = new URLSearchParams(window.location.search)
    parameters.forEach((value, key) => {
      if (key === 'search') emit('search-start', { str: value, origin: SEARCH_ORIGIN.url })
      else if (key === 'add') this.openAddItemModal(value)
    })
  }
  openAddItemModal (input: string) {
    const link = document.createElement('a')
    link.dataset.input = input
    emit('app-modal--add-item--open', link)
  }
}

export default new UrlService()
