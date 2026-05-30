import { memo, useCallback } from 'react'
import type { Item } from '../types/item.types'
import type { Display } from '../types/theme.types'
import { itemToImageUrl } from '../utils/database.utils'
import { navigate } from '../utils/navigation.utils'
import { AppLocSticker } from './app-loc-sticker'

type Props = Readonly<{
  display: Display
  isLoading?: boolean
  item: Item
  onSelect?: (item: Item, isSelected: boolean) => void
  showPrice?: boolean
}>

function AppItemListEntryComponent({ display, item, isLoading = false }: Props) {
  const goToDetails = useCallback(() => navigate(`/item/details/${item.$id}`), [item.$id])

  if (display === 'card')
    return (
      <a
        className={`item-card ${isLoading ? 'opacity-60' : ''}`}
        href={`/item/details/${item.$id}`}
        onClick={event => {
          event.preventDefault()
          goToDetails()
        }}
      >
        <div className="item-card-photo">
          <div className="item-card-photo-inner bg-white">
            <img alt={item.name} data-testid="item-card-entry-image" loading="lazy" src={itemToImageUrl(item)} />
          </div>
        </div>
        <div className="item-card-body">
          {item.brand.length > 0 && <div className="item-card-brand">{item.brand}</div>}
          <div className="item-card-name">{item.name}</div>
          <AppLocSticker box={item.box} drawer={item.drawer} rotate={-1.5} />
        </div>
      </a>
    )

  return (
    <a
      className={`item-row ${isLoading ? 'opacity-60' : ''}`}
      href={`/item/details/${item.$id}`}
      onClick={event => {
        event.preventDefault()
        goToDetails()
      }}
    >
      <div className="item-row-thumb">
        <img alt={item.name} data-testid="item-list-entry-image" loading="lazy" src={itemToImageUrl(item)} />
      </div>
      <div className="item-row-body">
        {item.brand.length > 0 && <div className="item-row-brand">{item.brand}</div>}
        <div className="item-row-name">{item.name}</div>
      </div>
      <AppLocSticker box={item.box} drawer={item.drawer} />
    </a>
  )
}

export const AppItemListEntry = memo(AppItemListEntryComponent)
