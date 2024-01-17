import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import type { Item } from '../types/item.types'
import { itemToImageUrl, onItemImageError } from '../utils/item.utils'

export function AppItemListEntry ({ item }: { readonly item: Item }) {

  const title = `${item.name}${item.brand ? ` - ${item.brand.trim()}` : ''}` // eslint-disable-line sonarjs/no-nested-template-literals
  const subtitle = `${item.category} - ${item.box.split(' ')[0] ?? ''}${item.drawer}`

  return (
    <ListItem disablePadding key={item.id}>
      {/* @ts-expect-error typings issue */}
      <ListItemButton component="a" href={`/item/details/${item.id}`}>
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <img alt={title} className="mr-4 size-12 rounded-full object-contain" data-id={item.id} onError={onItemImageError} src={itemToImageUrl(item)} />
        <ListItemText primary={title} primaryTypographyProps={{ fontSize: 18 }} secondary={subtitle} secondaryTypographyProps={{ fontSize: 16 }} />
      </ListItemButton>
    </ListItem>
  )
}
