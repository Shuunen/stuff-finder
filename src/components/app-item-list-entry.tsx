import { Button, Checkbox } from '@mui/material'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { memo, useCallback, useMemo, useState } from 'react'
import { formatCurrency } from '../pages/page-metrics.utils'
import type { Item } from '../types/item.types'
import type { Display } from '../types/theme.types'
import { itemToImageUrl } from '../utils/database.utils'
import { itemToLocation } from '../utils/item.utils'
import { navigate } from '../utils/navigation.utils'

type Props = Readonly<{
  display: Display
  isLoading?: boolean
  item: Item
  onSelect?: (item: Item, isSelected: boolean) => void
  showPrice?: boolean
}>

// oxlint-disable-next-line max-lines-per-function
function AppItemListEntryComponent({ display, item, showPrice, onSelect, isLoading = false }: Props) {
  const title = `${item.name}${typeof item.brand === 'string' && item.brand.length > 0 ? ` - ${item.brand.trim()}` : ''}`
  const titleStyle = useMemo(() => ({ color: 'black', fontSize: 18, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }), [])
  const location = itemToLocation(item)
  const subtitle = showPrice ? `${location} - ${formatCurrency(item.price)}` : location
  const displaySubtitle = isLoading ? 'Updating price...' : subtitle
  const subtitleStyle = useMemo(
    () => ({
      color: display === 'card' ? '#333' : 'grey',
      fontSize: 16,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
    [display],
  )
  const listStyle = useMemo(
    () => ({
      background: 'white',
      color: 'black',
      filter: isLoading ? 'brightness(0.9)' : '',
      transition: 'filter .3s',
    }),
    [isLoading],
  )
  const cardStyle = useMemo(
    () => ({
      ':hover': { boxShadow: '0 0 20px 0 rgba(0, 0, 0, 0.5)' },
      height: '100%',
      maxWidth: 300,
      position: 'relative',
      width: '100%',
    }),
    [],
  )
  const imgStyle = useMemo(() => ({ aspectRatio: 1, objectFit: 'contain', padding: '1vw 1vw 0 1vw', width: '100%' }), [])
  const floatingHeaderStyle = useMemo(
    () => ({
      background: 'whitesmoke',
      color: 'black',
      fontSize: 18,
      height: '100%',
      marginBottom: 0,
      paddingX: 2,
      paddingY: 1,
      width: '100%',
    }),
    [],
  )
  const goToDetails = useCallback(() => navigate(`/item/details/${item.$id}`), [item.$id])
  // handle selection
  const [checked, setChecked] = useState(false)
  const toggleSelection = useCallback(() => {
    setChecked(currentChecked => {
      const newSelected = !currentChecked
      if (onSelect) onSelect(item, newSelected)
      return newSelected
    })
  }, [item, onSelect])
  const secondaryAction =
    !isLoading && onSelect ? (
      <Button endIcon={<Checkbox checked={checked} edge="end" />} onClick={toggleSelection}>
        Select
      </Button>
    ) : undefined
  return (
    <ListItem data-type="list-item" disablePadding key={item.$id} secondaryAction={secondaryAction}>
      {display === 'list' && (
        <ListItemButton component="a" disabled={isLoading} href={`/item/details/${item.$id}`} sx={listStyle}>
          <img alt={title} className="mr-4 size-12 rounded-full object-contain" data-test="item-list-entry-image" loading="lazy" src={itemToImageUrl(item)} />
          <ListItemText
            primary={title}
            secondary={displaySubtitle}
            slotProps={{
              primary: titleStyle,
              secondary: subtitleStyle,
            }}
          />
        </ListItemButton>
      )}
      {display === 'card' && (
        <Card onClick={goToDetails} sx={cardStyle}>
          <CardMedia alt={title} component="img" data-test="item-card-entry-image" image={itemToImageUrl(item)} loading="lazy" sx={imgStyle} />
          <ListItemText
            primary={title}
            secondary={displaySubtitle}
            slotProps={{
              primary: titleStyle,
              secondary: subtitleStyle,
            }}
            sx={floatingHeaderStyle}
          />
        </Card>
      )}
    </ListItem>
  )
}

export const AppItemListEntry = memo(AppItemListEntryComponent)
