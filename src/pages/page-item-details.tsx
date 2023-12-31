import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import { AppPageBottom } from '../components/app-page-bottom'
import { setTitle } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

export function PageItemDetails ({ ...properties }: { readonly [key: string]: unknown }) {
  if (typeof properties.id !== 'string') return <>An id in the url is required</>
  const item = state.items.find(one => one.id === properties.id)
  if (item === undefined) return <>Item with id &quot;{properties.id}&quot; not found ;(</>
  logger.debug('PageItemDetails', { item })
  setTitle(`${item.name} - Details`)
  return (
    <div className="flex flex-col" data-page="item-details">
      <h1>{item.name}</h1>
      <AppPageBottom icon={ManageSearchIcon} nextLabel="Edit" nextUrl={`/item/edit/${item.id}`} />
    </div>
  )
}
