import { dom, emit, sleep } from 'shuutils'
import { JSON_HEADERS } from './constants'
import { storage } from './services/storage'

export const button = (content: string, classes = '', secondary = false): HTMLButtonElement => {
  const theme = secondary ? 'hover:opacity-100 opacity-80' : 'from-purple-500 to-purple-700 text-white hover:from-purple-700 hover:to-purple-900'
  const button_ = dom('button', `text-lg h-10 max-w-xs px-12 md:text-base bg-gradient-to-tr shadow-md hover:shadow-lg rounded transition-all duration-200 each-in-out sm:px-6 ${theme} ${classes}`, content)
  button_.type = 'button'
  return button_
}

const urlToUuid = (url: string): string => {
  // in: https://wrapapi.com/use/jojo/deyes/json/0.0.2?code=3760052142741&wrapAPIKey=xyz
  // out: wrapapicomusejojodeyesjson002code3760052142741
  return url.split('://')[1].split('&wrapAPIKey')[0].replace(/\W/g, '')
}

const request = async (method: 'patch' | 'post' | 'get', url: string, data?: Record<string, unknown>) => {
  const options: RequestInit = { headers: JSON_HEADERS, method }
  if (data) options.body = JSON.stringify(data)
  return fetch(url, options).then(response => response.json()).catch(error => showError(error.message))
}
export const patch = async (url: string, data: Record<string, unknown>) => request('patch', url, data)
export const post = async (url: string, data: Record<string, unknown>) => request('post', url, data)
export const get = async <T> (url: string): Promise<T> => request('get', url)
export const getCached = async <T> (url: string): Promise<T> => {
  const uuid = urlToUuid(url)
  const cached = await storage.get<T>(uuid, sessionStorage)
  if (cached) return cached
  const response = await request('get', url)
  storage.set(uuid, response, sessionStorage)
  return response as T
}

export const showError = (message: string) => {
  console.error(message)
  emit('app-toaster--show', { type: 'error', message })
}

export const showLog = (message: string, data = '') => {
  console.log(message, data)
  emit('app-toaster--show', { type: 'info', message })
}

export const fadeIn = async (element: HTMLElement) => {
  if (!element.classList.contains('hide')) return console.warn('please add "hide" class before mounting dom element and then call fade-in')
  element.classList.remove('hidden')
  await sleep(10)
  element.style.opacity = '1'
}

export const fadeOut = async (element: HTMLElement, destroy = false) => {
  element.classList.add('hide')
  element.style.opacity = '0'
  await sleep(350)
  element.classList.add('hidden')
  if (!destroy) return
  await sleep(350)
  element.remove()
}

export const valuesToOptions = (array: string[]): string => {
  return array.map(value => `<option value="${value}">${value}</option>`).join('')
}
