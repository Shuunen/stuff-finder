/* global localStorage, CustomEvent */

import pkg from '../../package.json'

class AppStorage {
  constructor () {
    this.on('storage-set', data => this.set(data.key, data.value))
    this.on('storage-search', this.search)
  }

  emit (eventName, eventData) {
    console.log(`emit event "${eventName}"`, eventData === undefined ? '' : eventData)
    window.dispatchEvent(new CustomEvent(eventName, { detail: eventData }))
  }

  on (eventName, callback) {
    window.addEventListener(eventName, event => callback.bind(this)(event.detail))
  }

  fullKey (key) {
    return `${pkg.name}_${key}`
  }

  async get (key) {
    const data = localStorage[this.fullKey(key)]
    if (!data) {
      throw new Error(`storage : found no matching key "${this.fullKey(key)}"`)
    }
    return (data[0] === '{') ? JSON.parse(data) : data
  }

  async set (key, data) {
    console.log(`storing ${key}...`, data)
    localStorage[this.fullKey(key)] = typeof data === 'object' ? JSON.stringify(data) : data
    return data
  }

  async has (key) {
    return this.get(key).then(value => !!value).catch(() => false)
  }

  async search (key) {
    const exists = await this.has(key)
    if (!exists) {
      return console.log(`key ${key} has not been found in storage`)
    }
    const value = await this.get(key)
    this.emit('storage-found', { key, value })
  }
}

export const appStorage = new AppStorage()
