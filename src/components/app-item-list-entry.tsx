import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import type { Item } from '../types/item.types'
import { addOrUpdateItems, airtableMaxRequestPerSecond, getOneItem } from '../utils/item.utils'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

function itemToImageUrl (item?: Item) {
  return item?.photo?.[0]?.url ?? 'https://via.placeholder.com/150?text=No+image'
}

async function onImageError (event: Event) {
  const image = event.target as HTMLImageElement // eslint-disable-line @typescript-eslint/consistent-type-assertions
  image.src = itemToImageUrl()
  if (document.querySelectorAll('img[data-id]').length > airtableMaxRequestPerSecond) return // prevent too many requests to airtable
  const { id } = image.dataset
  if (id === undefined) throw new Error('no id found on image')
  logger.debug('image url for item', id, 'has been deprecated, fetching fresh data from server...')
  const item = await getOneItem(id)
  image.src = itemToImageUrl(item)
  state.items = addOrUpdateItems(state.items, item)
}

export function AppItemListEntry ({ item }: { readonly item: Item }) {
  return (
    <ListItem disablePadding key={item.id}>
      {/* @ts-expect-error typings issue */}
      <ListItemButton component="a" href={`/item/details/${item.id}`}>
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <img alt={item.name} className="mr-4 h-12 w-12 rounded-full" data-id={item.id} onError={onImageError} src={itemToImageUrl(item)} />
        <ListItemText primary={item.name} />
      </ListItemButton>
    </ListItem>
  )
}
