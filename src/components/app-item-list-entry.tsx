import { memo, useCallback } from 'react'
import { cn } from 'shuutils'
import type { Item } from '../types/item.types'
import type { Display } from '../types/theme.types'
import { itemToImageUrl } from '../utils/database.utils'
import { navigate } from '../utils/navigation.utils'
import { AppLocSticker } from './app-loc-sticker'
import { AppPill } from './app-pill'

const maxStaggerIndex = 10
const staggerStepMs = 50

type Props = Readonly<{
  className?: string
  display: Display
  index?: number
  isLoading?: boolean
  item: Item
}>

function renderDetails(item: Item) {
  return (
    <>
      {item.brand.length > 0 && <em className="whitespace-normal">{item.brand}</em>}
      <h2 className="whitespace-normal">{item.name}</h2>
    </>
  )
}

function AppItemListEntryComponent({ className, display, index = 0, item, isLoading = false }: Props) {
  const goToDetails = useCallback(() => navigate(`/item/details/${item.$id}`), [item.$id])
  const staggerDelay = `${Math.min(index, maxStaggerIndex) * staggerStepMs}ms`

  if (display === 'card')
    return (
      <a
        className={cn(`block animate-fade-up transition`, isLoading && 'opacity-60', className)}
        style={{ animationDelay: staggerDelay }}
        href={`/item/details/${item.$id}`}
        onClick={event => {
          event.preventDefault()
          goToDetails()
        }}
      >
        <AppPill name="item-card" hover className="flex w-full flex-col items-start gap-4 rounded-xl bg-white p-4!">
          <img alt={item.name} className="mx-auto max-h-96" data-testid="item-card-entry-image" loading="lazy" src={itemToImageUrl(item)} />
          <div className="grid gap-2">
            {renderDetails(item)}
            <AppLocSticker className="absolute -top-1 -right-2" box={item.box} drawer={item.drawer} rotate={3.5} />
          </div>
        </AppPill>
      </a>
    )

  return (
    <a
      className={cn(`flex animate-fade-up items-center gap-4`, isLoading && 'opacity-60', className)}
      href={`/item/details/${item.$id}`}
      onClick={event => {
        event.preventDefault()
        goToDetails()
      }}
      style={{ animationDelay: staggerDelay }}
    >
      <AppPill name="item-list" hover className="relative flex w-full flex-col gap-4 rounded-xl bg-white md:flex-row">
        <img alt={item.name} className="object-contain p-2 md:max-h-36 md:w-36" data-testid="item-list-entry-image" loading="lazy" src={itemToImageUrl(item)} />
        <div className="mr-auto grid gap-2">{renderDetails(item)}</div>
        <AppLocSticker className="absolute -top-2 -right-2 md:relative md:top-auto md:right-4" box={item.box} drawer={item.drawer} />
      </AppPill>
    </a>
  )
}

export const AppItemListEntry = memo(AppItemListEntryComponent)
