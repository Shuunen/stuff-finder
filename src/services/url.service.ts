import { emit, on, sleep } from 'shuutils'
import { delays } from '../constants'
import type { AppModalAddItemOpenEvent, ItemsReadyEvent, SearchStartEvent } from '../types/events.types'
import { logger } from '../utils/logger.utils'

class UrlService {
  public constructor () {
    on<ItemsReadyEvent>('items-ready', this.check.bind(this))
  }

  private openAddItemModal (input: string) {
    const link = document.createElement('a')
    link.dataset.input = input
    emit<AppModalAddItemOpenEvent>('app-modal--add-item--open', link)
  }

  private async check () {
    await sleep(delays.small) // needed
    const parameters = new URLSearchParams(window.location.search)
    parameters.forEach((value, key) => {
      if (key === 'search') emit<SearchStartEvent>('search-start', { origin: 'url', str: value })
      else if (key === 'add') this.openAddItemModal(value)
      else logger.info(`unknown parameter key "${key}" with value "${value}"`)
    })
  }

}

// eslint-disable-next-line import/no-anonymous-default-export
export default new UrlService()
