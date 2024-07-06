
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { route } from 'preact-router'
import { useCallback, useMemo } from 'preact/hooks'
import type { Display } from '../types/theme.types'
import { itemToImageUrl, onItemImageError } from '../utils/item.utils'
import type { Item } from '../utils/parsers.utils'

// eslint-disable-next-line max-statements, @typescript-eslint/prefer-readonly-parameter-types
export function AppItemListEntry ({ display, item }: Readonly<{ display: Display; item: Item }>) {
  const title = `${item.name}${item.brand ? ` - ${item.brand.trim()}` : ''}`
  const titleStyle = useMemo(() => ({ fontSize: 18, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }), [])
  const drawer = `${item.box.split(' ')[0] ?? ''}${item.drawer}`.trim()
  const subtitle = `${item.category}${drawer.length > 0 ? ' - ' : ''}${drawer}`
  const subtitleStyle = useMemo(() => ({ color: display === 'card' ? '#333' : 'grey', fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }), [display])
  const listStyle = useMemo(() => ({ background: 'white', transition: 'filter 0.3s' }), [])
  const cardStyle = useMemo(() => ({ ':hover': { boxShadow: '0 0 20px 0 rgba(0, 0, 0, 0.5)' }, 'cursor': 'pointer', 'height': '100%', 'position': 'relative', 'width': '100%' }), [])
  const imgStyle = useMemo(() => ({ aspectRatio: 1, objectFit: 'contain', padding: '1vw 1vw 0 1vw', width: '100%' }), [])
  const floatingHeaderStyle = useMemo(() => ({ background: 'whitesmoke', color: 'black', fontSize: 18, height: '100%', marginBottom: 0, paddingX: 2, paddingY: 1, width: '100%' }), [])
  const goToDetails = useCallback(() => route(`/item/details/${item.id}`), [item.id])
  return (
    <ListItem data-type="list-item" disablePadding key={item.id} sx={listStyle}>{/* @ts-expect-error typings issue */}
      {display === 'list' && <ListItemButton component="a" href={`/item/details/${item.id}`}>
        <img alt={title} className="mr-4 size-12 rounded-full object-contain" data-id={item.id} onError={onItemImageError} src={itemToImageUrl(item)} />
        <ListItemText primary={title} primaryTypographyProps={titleStyle} secondary={subtitle} secondaryTypographyProps={subtitleStyle} />
      </ListItemButton>}
      {display === 'card' && <Card onClick={goToDetails} sx={cardStyle}>{/* @ts-expect-error typings issue */}
        <CardMedia alt={title} component="img" image={itemToImageUrl(item)} onError={onItemImageError} sx={imgStyle} />
        <ListItemText primary={title} primaryTypographyProps={titleStyle} secondary={subtitle} secondaryTypographyProps={subtitleStyle} sx={floatingHeaderStyle} />
      </Card>}
    </ListItem>
  )
}
