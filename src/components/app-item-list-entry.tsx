import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { useMemo } from 'preact/hooks'
import { itemToImageUrl, onItemImageError } from '../utils/item.utils'
import type { Item } from '../utils/parsers.utils'

export function AppItemListEntry ({ item }: Readonly<{ item: Item }>) {
  const title = `${item.name}${item.brand ? ` - ${item.brand.trim()}` : ''}` // eslint-disable-line sonarjs/no-nested-template-literals
  const titleStyle = useMemo(() => ({ fontSize: 18 }), [])
  const drawer = `${item.box.split(' ')[0] ?? ''}${item.drawer}`.trim()
  const subtitle = `${item.category}${drawer.length > 0 ? ' - ' : ''}${drawer}`
  const subtitleStyle = useMemo(() => ({ fontSize: 16 }), [])
  return (
    <ListItem disablePadding key={item.id}>
      {/* @ts-expect-error typings issue */}
      <ListItemButton component="a" href={`/item/details/${item.id}`}>

        <img alt={title} className="mr-4 size-12 rounded-full object-contain" data-id={item.id} onError={onItemImageError} src={itemToImageUrl(item)} />
        <ListItemText primary={title} primaryTypographyProps={titleStyle} secondary={subtitle} secondaryTypographyProps={subtitleStyle} />
      </ListItemButton>
    </ListItem>
  )
}
