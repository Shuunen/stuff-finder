import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import { AppItemDetails } from '../components/app-item-details'
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
    <div className="flex w-full grow flex-col" data-page="item-details">
      <AppItemDetails item={item} />
      <div className="hidden md:block">
        {/* eslint-disable-next-line @typescript-eslint/no-magic-numbers */}
        <AppPageBottom icon={ManageSearchIcon} nextLabel="Edit" nextUrl={`/item/edit/${item.id}`} stepsBack={properties.context === 'single' ? 2 : 1} />
      </div>
    </div>
  )
}
