import { BrowserScout } from 'shuutils'
import { logger } from './logger.utils'
import { state } from './state.utils'

const scout = new BrowserScout()
logger.info('browser scout', scout)

function airtableHeaders (token: string) {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  return { 'Accept': 'application/json', 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
}

async function request (method: 'DELETE' | 'GET' | 'PATCH' | 'POST', url: string, data?: Record<string, unknown>) {
  const options: RequestInit = { headers: airtableHeaders(state.credentials.token), method }
  if (data) options.body = JSON.stringify(data)
  const response = await fetch(url, options).catch((error: unknown) => { logger.showError(error) })
  if (!response) throw new Error('no response')
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return await response.json() as unknown
}

export async function del (url: string) {
  return await request('DELETE', url)
}

export async function patch (url: string, data: Record<string, unknown>) {
  return await request('PATCH', url, data)
}

export async function post (url: string, data: Record<string, unknown>) {
  return await request('POST', url, data)
}

export async function get (url: string) {
  return await request('GET', url)
}

export function valuesToOptions (array: readonly string[], selected?: string) {
  return array.map(value => `<option value="${value}" ${selected === value ? 'selected' : ''}>${value}</option>`).join('')
}

export { scout }

export function setPageTitle (title: string) {
  document.title = `${title} - Stuff Finder`
}
