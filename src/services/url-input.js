/* global document */
import { emit, on } from 'shuutils'
import { SEARCH_ORIGIN } from '../constants.js'

class AppUrlInput {
  constructor() {
    const search = (document.location.search.match(/search=(\w+)/i) || [])[1] || ''
    if (search === '') return
    console.log('found search in url :', search)
    on('items-ready', () => emit('search-start', { str: search, origin: SEARCH_ORIGIN.url }))
  }
}

export const appSound = new AppUrlInput()
