import Print from '@mui/icons-material/Print'
import { AppPageCard } from '../components/app-page-card'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

export function PageItemPrint ({ ...properties }: { readonly [key: string]: unknown }) {
  if (typeof properties.id !== 'string') return <>An id in the url is required</>
  const item = state.items.find(one => one.id === properties.id)
  if (item === undefined) return <>Item with id &quot;{properties.id}&quot; not found ;(</>
  logger.debug('PageItemPrint', { item })
  return (
    <AppPageCard cardTitle="Print" icon={Print} pageCode="item-print" pageTitle={`${item.name} - Print`}>
      <h1>{item.name}</h1>
    </AppPageCard>
  )
}
