/* eslint-disable jsdoc/require-jsdoc */
import { logger } from './logger.utils'

async function request (method: 'DELETE' | 'GET' | 'PATCH' | 'POST', url: string, data?: Record<string, unknown>) {
  const options: RequestInit = { method }
  if (data) options.body = JSON.stringify(data)
  const response = await fetch(url, options).catch((error: unknown) => { logger.showError(error) })
  // eslint-disable-next-line no-restricted-syntax
  if (!response) throw new Error('no response')
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return await response.json() as unknown
}

// biome-ignore lint/suspicious/useAwait: <explanation>
export async function get (url: string) {
  return request('GET', url)
}

export function valuesToOptions (array: readonly string[], selected?: string) {
  return array.map(value => `<option value="${value}" ${selected === value ? 'selected' : ''}>${value}</option>`).join('')
}

export function setPageTitle (title: string) {
  document.title = `${title} - Stuff Finder`
}

export function clearElementsForPrint () {
  logger.info('clearing elements for print')
  const selector = [
    '#synology-download-notification-stack',
    'synology-download-content',
    '[at-magnifier-wrapper]',
    '.shu-toast',
  ]
  const elements = document.querySelectorAll(selector.join(','))
  for (const element of elements) element.remove()
}
