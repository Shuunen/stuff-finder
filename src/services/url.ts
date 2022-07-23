import { emit, on, sleep } from 'shuutils'

class UrlService {
  constructor () {
    on('items-ready', () => this.check())
  }
  async check (): Promise<void> {
    await sleep(100) // needed
    const parameters = new URLSearchParams(window.location.search)
    parameters.forEach((value, key) => {
      if (key === 'search') emit('search-start', { str: value, origin: 'url' } as SearchStartEvent)
      else if (key === 'add') this.openAddItemModal(value)
    })
  }
  openAddItemModal (input: string): void {
    const link = document.createElement('a')
    link.dataset.input = input
    emit('app-modal--add-item--open', link)
  }
}

export default new UrlService()
