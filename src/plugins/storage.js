import pkg from '../../package.json'
import { BaseModel } from '../model'

class PluginStorage extends BaseModel {
  constructor () {
    super('storage')
    this.log('constructor')
    this.on('storage-set', data => this.set(data.key, data.value))
    this.on('storage-search', this.search)
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
    this.log(`storing ${key}...`, data)
    localStorage[this.fullKey(key)] = typeof data === 'object' ? JSON.stringify(data) : data
    return data
  }

  async has (key) {
    return this.get(key).then(value => !!value).catch(() => false)
  }

  async search (key) {
    const exists = await this.has(key)
    if (!exists) {
      return this.log(`key ${key} has not been found in storage`)
    }
    const value = await this.get(key)
    this.emit('storage-found', { key, value })
  }
}

export const pluginStorage = new PluginStorage()
