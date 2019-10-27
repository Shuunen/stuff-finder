
import pkg from '../../package.json'

const separator = '_'
const baseKey = `${pkg.name}`

console.log('local storage will use base key :', baseKey)

export async function get (key) {
  const fullKey = baseKey + separator + key
  const data = localStorage[fullKey]
  if (!data) {
    return Promise.reject(new Error(`storage : found no matching key "${fullKey}"`))
  }
  try {
    return Promise.resolve((data[0] === '{') ? JSON.parse(data) : data)
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function set (key, data) {
  const fullKey = baseKey + separator + key
  localStorage[fullKey] = typeof data === 'object' ? JSON.stringify(data) : data
  return Promise.resolve(data)
}

export async function has (key) {
  return this.get(key).then(value => !!value).catch(() => false)
}
