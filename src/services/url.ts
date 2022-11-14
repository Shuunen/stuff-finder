import { emit, on, sleep } from 'shuutils'
import type { AppModalAddItemOpenEvent, ItemsReadyEvent, SearchStartEvent } from '../types'

class UrlService {
  public constructor () {
    on<ItemsReadyEvent>('items-ready', this.check.bind(this))
  }

  private async check (): Promise<void> {
    await sleep(100) // needed
    const parameters = new URLSearchParams(window.location.search) // TODO : use hash instead
    parameters.forEach((value, key) => {
      if (key === 'search') emit<SearchStartEvent>('search-start', { str: value, origin: 'url' })
      else if (key === 'add') this.openAddItemModal(value)
    })
  }

  private openAddItemModal (input: string): void {
    const link = document.createElement('a')
    link.dataset['input'] = input
    emit<AppModalAddItemOpenEvent>('app-modal--add-item--open', link)
  }
}

export default new UrlService()
