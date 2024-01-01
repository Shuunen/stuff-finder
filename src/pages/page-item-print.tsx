import { setTitle } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

export function PageItemPrint ({ ...properties }: { readonly [key: string]: unknown }) {
  if (typeof properties.id !== 'string') return <>An id in the url is required</>
  const item = state.items.find(one => one.id === properties.id)
  if (item === undefined) return <>Item with id &quot;{properties.id}&quot; not found ;(</>
  logger.debug('PageItemPrint', { item })
  setTitle(`${item.name} - Print`)
  return (
    <div className="flex w-full grow flex-col" data-page="item-print">
      <h3>Print</h3>
      <h1>{item.name}</h1>
    </div>
  )
}
