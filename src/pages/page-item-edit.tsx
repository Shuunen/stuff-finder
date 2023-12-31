import EditNoteIcon from '@mui/icons-material/EditNote'
import { AppPageBottom } from '../components/app-page-bottom'
import { setTitle } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

export function PageItemEdit ({ ...properties }: { readonly [key: string]: unknown }) {
  if (typeof properties.id !== 'string') return <>An id in the url is required</>
  const item = state.items.find(one => one.id === properties.id)
  if (item === undefined) return <>Item with id &quot;{properties.id}&quot; not found ;(</>
  logger.debug('PageItemEdit', { item })
  setTitle(`${item.name} - Edit`)
  return (
    <div className="flex flex-col" data-page="item-edit">
      <h1>Edit</h1>
      <h2>{item.name}</h2>
      <AppPageBottom icon={EditNoteIcon} nextLabel="Save" nextUrl="/save" />
    </div >
  )
}
