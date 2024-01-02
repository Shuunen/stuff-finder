import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import { AppItemDetails } from '../components/app-item-details'
import { AppPageCard } from '../components/app-page-card'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

export function PageItemDetails ({ ...properties }: { readonly [key: string]: unknown }) {
  if (typeof properties.id !== 'string') return <>An id in the url is required</>
  const item = state.items.find(one => one.id === properties.id)
  if (item === undefined) return <>Item with id &quot;{properties.id}&quot; not found ;(</>
  logger.debug('PageItemDetails', { item })
  const stepsBack = properties.context === 'single' ? 2 : 1 // eslint-disable-line @typescript-eslint/no-magic-numbers
  return (
    <AppPageCard cardTitle="Details" icon={ManageSearchIcon} nextLabel="Edit" nextUrl={`/item/edit/${item.id}`} pageCode="item-details" pageTitle={`${item.name} - Details`} stepsBack={stepsBack}>
      <AppItemDetails item={item} />
    </AppPageCard>
  )
}
