import { BrowserScout } from 'shuutils'
import { logger } from './logger.utils'
import { state } from './state.utils'
import { storage } from './storage.utils'
import { urlToUuid } from './url.utils'

const scout = new BrowserScout()
logger.info('browser scout', scout)

function airtableHeaders (token: string) {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  return { 'Accept': 'application/json', 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
}

async function request<ResponseType = unknown> (method: 'GET' | 'PATCH' | 'POST', url: string, data?: Record<string, unknown>) {
  const options: RequestInit = { headers: airtableHeaders(state.credentials.token), method }
  if (data) options.body = JSON.stringify(data)
  const response = await fetch(url, options).catch((error: unknown) => { logger.showError(error) })
  if (!response) throw new Error('no response')
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return (await response.json()) as ResponseType
}

export async function patch<ResponseType> (url: string, data: Record<string, unknown>) {
  return await request<ResponseType>('PATCH', url, data)
}

export async function post<ResponseType> (url: string, data: Record<string, unknown>) {
  return await request<ResponseType>('POST', url, data)
}

export async function get<ResponseType> (url: string, willCacheResponse = true) {
  const uuid = urlToUuid(url)
  if (willCacheResponse) {
    const cached = storage.get<ResponseType>(uuid)
    if (cached !== undefined) return cached
  }
  const response = await request<ResponseType>('GET', url)
  if (willCacheResponse) storage.set(uuid, response)
  return response
}

// eslint-disable-next-line import/no-unused-modules
export function valuesToOptions (array: readonly string[], selected?: string) {
  return array.map(value => `<option value="${value}" ${selected === value ? 'selected' : ''}>${value}</option>`).join('')
}

export { scout }

export function setPageTitle (title: string) {
  document.title = `${title} - Stuff Finder`
}
