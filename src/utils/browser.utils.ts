import { logger } from './logger.utils'
import { state } from './state.utils'

function airtableHeaders (token: string) {
  // biome-ignore lint/style/useNamingConvention: <explanation>
  return { 'Accept': 'application/json', 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } // eslint-disable-line @typescript-eslint/naming-convention
}

async function request (method: 'DELETE' | 'GET' | 'PATCH' | 'POST', url: string, data?: Record<string, unknown>) {
  const options: RequestInit = { headers: airtableHeaders(state.credentials.token), method }
  // eslint-disable-next-line functional/immutable-data
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

export function setPageTitle (title: string) {
  // eslint-disable-next-line functional/immutable-data
  document.title = `${title} - Stuff Finder`
}

export function clearElementsForPrint () {
  const selector = [
    '#synology-download-notification-stack',
    'synology-download-content',
    '[at-magnifier-wrapper]',
  ]
  const elements = document.querySelectorAll(selector.join(','))
  for (const element of elements) element.remove()
}
