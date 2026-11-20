import { type MouseEvent, useCallback } from 'react'
import { tw } from 'shuutils'
import { formatCurrency } from '../pages/page-metrics.utils'
import type { Item } from '../types/item.types'
import { cn } from '../utils/class.utils'
import { itemToImageUrl } from '../utils/database.utils'
import { navigate } from '../utils/navigation.utils'
import { AppCard } from './app-card'
import { AppItemImage } from './app-item-image'
import { AppLocSticker } from './app-loc-sticker'

const rankClasses = [tw('bg-pastel-1'), tw('bg-pastel-3'), tw('bg-pastel-4')]

function rankToClass(rank: number) {
  return rankClasses[rank - 1] ?? tw('bg-white')
}

type Props = Readonly<{
  item: Item
  /** When defined, the entry is a ranked row with the price of the item */
  rank?: number
}>

export function AppMetricItemEntry({ item, rank }: Props) {
  const url = `/item/details/${item.$id}`
  const goToDetails = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
      navigate(url)
    },
    [url],
  )
  const isRanked = rank !== undefined
  return (
    <a data-testid={isRanked ? 'metric-top-item' : 'metric-give-item'} href={url} onClick={goToDetails}>
      <AppCard name="metric-item" hover className={cn('gap-3 p-3', isRanked ? 'flex-row items-center' : 'items-start')}>
        {isRanked && (
          <span className={cn('grid size-9 shrink-0 place-items-center rounded-full border-2 font-bold', rankToClass(rank))} data-testid="metric-item-rank">
            {rank}
          </span>
        )}
        <div className={cn('flex min-w-0 items-center gap-3', isRanked ? 'grow' : 'w-full')}>
          <AppItemImage alt={item.name} className="size-14 shrink-0 rounded-lg object-contain" height={56} loading="lazy" src={itemToImageUrl(item)} width={56} />
          <div className="grid min-w-0 gap-1">
            {item.brand.length > 0 && <em className="truncate">{item.brand}</em>}
            <h2 className="text-base leading-tight">{item.name}</h2>
            {isRanked && <p className="font-bold">{formatCurrency(item.price)}</p>}
          </div>
        </div>
        <AppLocSticker box={item.box} drawer={item.drawer} />
      </AppCard>
    </a>
  )
}
