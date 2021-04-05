/* global localStorage */

import { emit, on } from 'shuutils'
import packageJson from '../../package.json'

class AppStorage {
  constructor() {
    on('storage-set', data => this.set(data.key, data.value))
    on('storage-search', key => this.search(key))
  }

  fullKey(key) {
    return `${packageJson.name}_${key}`
  }

  async get(key) {
    const data = localStorage[this.fullKey(key)]
    if (!data) throw new Error(`storage : found no matching key "${this.fullKey(key)}"`)
    return (data[0] === '{') ? JSON.parse(data) : data
  }

  async set(key, data) {
    console.log(`storing ${key}...`, data)
    localStorage[this.fullKey(key)] = typeof data === 'object' ? JSON.stringify(data) : data
    return data
  }

  async has(key) {
    return this.get(key).then(value => Boolean(value)).catch(() => false)
  }

  async search(key) {
    const exists = await this.has(key)
    if (!exists) return console.log(`key ${key} has not been found in storage`)
    const value = await this.get(key)
    emit('storage-found', { key, value })
  }
}

export const appStorage = new AppStorage()
