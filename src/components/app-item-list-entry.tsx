import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { useMemo } from 'preact/hooks'
import type { Display } from '../types/theme.types'
import { itemToImageUrl, onItemImageError } from '../utils/item.utils'
import type { Item } from '../utils/parsers.utils'

export function AppItemListEntry ({ display, item }: Readonly<{ display: Display; item: Item }>) {
  const title = `${item.name}${item.brand ? ` - ${item.brand.trim()}` : ''}` // eslint-disable-line sonarjs/no-nested-template-literals
  const titleStyle = useMemo(() => ({ fontSize: 18, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }), [])
  const drawer = `${item.box.split(' ')[0] ?? ''}${item.drawer}`.trim()
  const subtitle = `${item.category}${drawer.length > 0 ? ' - ' : ''}${drawer}`
  const subtitleStyle = useMemo(() => ({ color: display === 'card' ? 'white' : 'grey', fontSize: 16 }), [display])
  const listStyle = useMemo(() => ({ background: 'white' }), [])
  const cardStyle = useMemo(() => ({ cursor: 'pointer', height: '100%', position: 'relative', width: '100%' }), [])
  const imgStyle = useMemo(() => ({ aspectRatio: 1, objectFit: 'contain', width: '100%' }), [])
  const floatingHeaderStyle = useMemo(() => ({ background: 'linear-gradient(0, black, #484848cc, transparent)', bottom: 0, color: 'white', marginBottom: -0.5, padding: '25px 8px 8px', position: 'absolute', width: '100%' }), [])
  return (
    <ListItem disablePadding key={item.id} sx={listStyle}>{/* @ts-expect-error typings issue */}
      {display === 'list' && <ListItemButton component="a" href={`/item/details/${item.id}`}>
        <img alt={title} className="mr-4 size-12 rounded-full object-contain" data-id={item.id} onError={onItemImageError} src={itemToImageUrl(item)} />
        <ListItemText primary={title} primaryTypographyProps={titleStyle} secondary={subtitle} secondaryTypographyProps={subtitleStyle} />
      </ListItemButton>}
      {display === 'card' && <Card sx={cardStyle}>{/* @ts-expect-error typings issue */}
        <CardMedia alt={title} component="img" image={itemToImageUrl(item)} onError={onItemImageError} sx={imgStyle} />
        <ListItemText primary={title} primaryTypographyProps={titleStyle} secondary={subtitle} secondaryTypographyProps={subtitleStyle} sx={floatingHeaderStyle} />
      </Card>}
    </ListItem>
  )
}
