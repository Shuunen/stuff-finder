
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { route } from 'preact-router'
import { useCallback, useMemo } from 'preact/hooks'
import type { Item } from '../types/item.types'
import type { Display } from '../types/theme.types'
import { itemToImageUrl } from '../utils/database.utils'
import { itemToLocation } from '../utils/item.utils'

export function AppItemListEntry ({ display, item }: Readonly<{ display: Display; item: Item }>) {
  const title = `${item.name}${(typeof item.brand === 'string') && item.brand.length > 0 ? ` - ${item.brand.trim()}` : ''}`
  const titleStyle = useMemo(() => ({ fontSize: 18, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }), [])
  const subtitle = itemToLocation(item)
  const subtitleStyle = useMemo(() => ({ color: display === 'card' ? '#333' : 'grey', fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }), [display])
  const listStyle = useMemo(() => ({ background: 'white', transition: 'filter 0.3s' }), [])
  const cardStyle = useMemo(() => ({ ':hover': { boxShadow: '0 0 20px 0 rgba(0, 0, 0, 0.5)' }, 'cursor': 'pointer', 'height': '100%', maxWidth: 300, 'position': 'relative', 'width': '100%' }), [])
  const imgStyle = useMemo(() => ({ aspectRatio: 1, objectFit: 'contain', padding: '1vw 1vw 0 1vw', width: '100%' }), [])
  const floatingHeaderStyle = useMemo(() => ({ background: 'whitesmoke', color: 'black', fontSize: 18, height: '100%', marginBottom: 0, paddingX: 2, paddingY: 1, width: '100%' }), [])
  const goToDetails = useCallback(() => route(`/item/details/${item.$id}`), [item.$id])
  return (
    (<ListItem data-type="list-item" disablePadding key={item.$id} sx={listStyle}>
      {display === 'list' && <ListItemButton component="a" href={`/item/details/${item.$id}`}>
        <img alt={title} class="mr-4 size-12 rounded-full object-contain" data-test="item-list-entry-image" loading="lazy" src={itemToImageUrl(item)} />
        <ListItemText
          primary={title}
          secondary={subtitle}
          slotProps={{
            primary: titleStyle,
            secondary: subtitleStyle,
          }} />
      </ListItemButton>}
      {display === 'card' && <Card onClick={goToDetails} sx={cardStyle}>
        <CardMedia alt={title} component="img" data-test="item-card-entry-image" image={itemToImageUrl(item)} loading="lazy" sx={imgStyle} />
        <ListItemText
          primary={title}
          secondary={subtitle}
          slotProps={{
            primary: titleStyle,
            secondary: subtitleStyle,
          }}
          sx={floatingHeaderStyle} />
      </Card>}
    </ListItem>)
  )
}
