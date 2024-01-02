import EditNoteIcon from '@mui/icons-material/EditNote'
import { AppItemDetails } from '../components/app-item-details'
import { AppPageCard } from '../components/app-page-card'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

export function PageItemEdit ({ ...properties }: { readonly [key: string]: unknown }) {
  if (typeof properties.id !== 'string') return <>An id in the url is required</>
  const item = state.items.find(one => one.id === properties.id)
  if (item === undefined) return <>Item with id &quot;{properties.id}&quot; not found ;(</>
  logger.debug('PageItemEdit', { item })
  return (
    <AppPageCard cardTitle="Edit" icon={EditNoteIcon} nextLabel="Save" nextUrl="/save" pageCode="item-edit" pageTitle={`${item.name} - Edit`}>
      <AppItemDetails item={item} />
    </AppPageCard>
  )
}
