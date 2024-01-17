import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import type { Item } from '../types/item.types'
import { itemToImageUrl, onItemImageError } from '../utils/item.utils'

export function AppItemListEntry ({ item }: { readonly item: Item }) {
  return (
    <ListItem disablePadding key={item.id}>
      {/* @ts-expect-error typings issue */}
      <ListItemButton component="a" href={`/item/details/${item.id}`}>
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <img alt={item.name} className="mr-4 size-12 rounded-full" data-id={item.id} onError={onItemImageError} src={itemToImageUrl(item)} />
        <ListItemText primary={item.name} />
      </ListItemButton>
    </ListItem>
  )
}
