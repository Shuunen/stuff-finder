// oxlint-disable react/no-multi-comp
import OutboxIcon from '@mui/icons-material/Outbox'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import SpeedIcon from '@mui/icons-material/Speed'
import { kebabCase } from 'es-toolkit'
import { memo, type MouseEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { tw } from 'shuutils'
import { AppButton } from '../components/app-button'
import { AppCard } from '../components/app-card'
import { AppItemList } from '../components/app-item-list'
import { AppLocSticker } from '../components/app-loc-sticker'
import { AppPageCard } from '../components/app-page-card'
import type { MuiIcon } from '../types/icons.types'
import type { Item } from '../types/item.types'
import { updateItem } from '../utils/item.utils'
import { logger } from '../utils/logger.utils'
import { navigate } from '../utils/navigation.utils'
import { state, watchState } from '../utils/state.utils'
import { findItemsWithBrokenPhoto } from './page-metrics.broken-photos'
import { calculateMetrics, formatCurrency, type MetricsData, topValueItems } from './page-metrics.utils'

// oxlint-disable-next-line no-magic-numbers
const priceList = [1, 2, 5, 10, 20, 50, 100, 200] as const

type MetricCardProps = {
  amount?: number | string
  children?: ReactNode
  color: string
  icon?: MuiIcon
  items?: Item[]
  loadingItemIds?: Item['$id'][]
  title: string
}

const iconStyle = { fontSize: '3rem' }

function MetricCardComponent(props: MetricCardProps) {
  const { title, color, amount, icon: Icon, items, children, loadingItemIds } = props
  const isHidden = items?.length === 0
  const isStat = amount !== undefined && Icon !== undefined

  return (
    <div
      data-testid={kebabCase(`metric-card-${title.split(' :')[0]}`)}
      className={`relative flex gap-4 rounded-lg border border-black/20 bg-white p-6 whitespace-nowrap shadow-sm ${color} ${isStat ? 'items-center justify-center' : ''} ${isHidden ? 'hidden' : ''}`}
    >
      {isStat && (
        <div className="flex shrink-0 items-center gap-2">
          <Icon className="opacity-30" sx={iconStyle} />
          <p className="ml-2 text-3xl leading-none font-bold">{amount}</p>
        </div>
      )}
      <div className={`flex flex-col gap-2 ${isStat ? 'justify-center' : 'w-full'}`}>
        <h2 className="text-xl font-semibold text-current">{title}</h2>
        {(children || items) && (
          <div className="scroll-shadow max-h-96 space-y-3 overflow-y-auto rounded-md bg-grey/10 p-1">
            {items && <AppItemList className="mb-0" display="list" items={items} loadingItemIds={loadingItemIds} />}
            {!items && children}
          </div>
        )}
        {items && children}
      </div>
    </div>
  )
}

const MetricCard = memo(MetricCardComponent)

MetricCard.displayName = 'MetricCard'

function MetricCardEntry({ box, count, value }: { box: Item['box']; count: number; value: string }) {
  const goToBox = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
      navigate(`/box/${encodeURIComponent(box)}`)
    },
    [box],
  )
  return (
    <a data-testid="metric-entry-link" href={`/box/${encodeURIComponent(box)}`} onClick={goToBox}>
      <AppCard name="metric-entry" hover className="flex-row items-center justify-between gap-4 p-3">
        <AppLocSticker box={box} hideParentheses />
        <div className="text-right">
          <p className="font-medium">{value}</p>
          <p className="text-sm text-grey">
            {count} {count === 1 ? 'item' : 'items'}
          </p>
        </div>
      </AppCard>
    </a>
  )
}

function removeItemsFromList(items: Item[], itemIds: string[]) {
  const itemIdsSet = new Set(itemIds)
  return items.filter(item => !itemIdsSet.has(item.$id))
}

async function updateItemsConcurrently(
  itemsToUpdate: Item[],
  price: number,
  options: {
    removeItemFromLists: (itemIds: string[]) => void
    setLoadingItemIds: (itemId: Item['$id'][] | undefined) => void
  },
) {
  if (itemsToUpdate.length === 0) return
  const ids = itemsToUpdate.map(item => item.$id)
  options.setLoadingItemIds(ids)

  const updatePromises = itemsToUpdate.map(async item => {
    const result = await updateItem({ ...item, price })
    if (result.ok) return { item, success: true }
    logger.showError(`Failed to update item ${item.name}: ${result.error}`)
    return { error: result.error, item, success: false }
  })

  const results = await Promise.all(updatePromises)
  const successfulUpdates = results.filter(result => result.success)

  // Batch remove all successful items at once to reduce re-renders
  if (successfulUpdates.length > 0) {
    const successfulItemIds = successfulUpdates.map(result => result.item.$id)
    options.removeItemFromLists(successfulItemIds)
    logger.showSuccess(`Updated ${successfulUpdates.length} item${successfulUpdates.length > 1 ? 's' : ''} with price ${price}€`)
  }

  options.setLoadingItemIds(undefined)
}

function filterSelectionByDisplayItems(selection: Item[], itemsToDisplay: Item[]) {
  const displayItemIds = new Set(itemsToDisplay.map(item => item.$id))
  return selection.filter(selectedItem => displayItemIds.has(selectedItem.$id))
}

function PriceButtons({ onPriceClick, selection }: { onPriceClick: (price: number) => Promise<void>; selection: Item[] }) {
  if (selection.length === 0) return undefined
  const label = selection.length > 1 ? `${selection.length} selected items` : 'selected item'
  return (
    <>
      <p data-testid="metrics-price-prompt">Set price for the {label} :</p>
      <div className="flex gap-4" data-testid="metrics-price-buttons">
        {priceList.map(price => (
          <AppButton name={`price-${price}`} key={price} label={`${price} €`} onClick={() => onPriceClick(price)} />
        ))}
      </div>
    </>
  )
}

function MetricCardMissingPriceListComponent({ metrics }: { metrics: MetricsData }) {
  const [baseSelection, setBaseSelection] = useState<Item[]>([])
  const [itemsToDisplay, setItemsToDisplay] = useState<Item[]>(() => [...metrics.itemsWithoutPrice])
  const [loadingItemIds, setLoadingItemIds] = useState<Item['$id'][] | undefined>()
  const selection = useMemo(() => filterSelectionByDisplayItems(baseSelection, itemsToDisplay), [baseSelection, itemsToDisplay])

  const removeItemsFromLists = useCallback((itemIds: string[]) => {
    setItemsToDisplay(current => removeItemsFromList(current, itemIds))
    setBaseSelection(current => removeItemsFromList(current, itemIds))
  }, [])

  const onPriceClick = useCallback(
    async (price: number) => {
      await updateItemsConcurrently(selection, price, { removeItemFromLists: removeItemsFromLists, setLoadingItemIds })
    },
    [selection, removeItemsFromLists],
  )

  return (
    <MetricCard color={tw('text-red-600')} items={itemsToDisplay} loadingItemIds={loadingItemIds} title={`Items without price : ${itemsToDisplay.length}`}>
      <PriceButtons onPriceClick={onPriceClick} selection={selection} />
    </MetricCard>
  )
}

const MetricCardMissingPriceList = memo(MetricCardMissingPriceListComponent)

MetricCardMissingPriceList.displayName = 'MetricCardMissingPriceList'

function MetricCardBrokenPhotosComponent({ items }: { items: Item[] }) {
  const [result, setResult] = useState<{ brokenItems: Item[]; checkedItems: Item[] }>({ brokenItems: [], checkedItems: [] })
  useEffect(() => {
    let isCancelled = false
    async function check() {
      const brokenItems = await findItemsWithBrokenPhoto(items)
      if (!isCancelled) setResult({ brokenItems, checkedItems: items })
    }
    void check()
    return () => {
      isCancelled = true
    }
  }, [items])
  const isChecking = result.checkedItems !== items
  const title = `Items with a photo that fails to load : ${result.brokenItems.length}${isChecking ? ' (checking...)' : ''}`
  if (result.brokenItems.length === 0)
    return (
      <MetricCard color={isChecking ? tw('text-blue-700') : tw('text-green-600')} title={title}>
        <p className="p-4 whitespace-normal">{isChecking ? 'Checking every photo, this can take a moment...' : 'All photos load correctly.'}</p>
      </MetricCard>
    )
  return <MetricCard color={tw('text-red-600')} items={result.brokenItems} title={title} />
}

const MetricCardBrokenPhotos = memo(MetricCardBrokenPhotosComponent)

MetricCardBrokenPhotos.displayName = 'MetricCardBrokenPhotos'

function OnDemandPhotoCheck({ items }: { items: Item[] }) {
  const [isStarted, setIsStarted] = useState(false)
  const start = useCallback(() => {
    setIsStarted(true)
  }, [])
  if (isStarted) return <MetricCardBrokenPhotos items={items} />
  return (
    <div className="flex items-start justify-center">
      <AppButton name="check-photos" label="Check photos that fail to load" onClick={start} />
    </div>
  )
}

export function PageMetrics({ ...properties }: Readonly<Record<string, unknown>>) {
  logger.debug('PageMetrics', { properties })
  const [items, setItems] = useState(state.items)
  watchState('items', () => {
    setItems(state.items)
  })
  const metrics = useMemo(() => calculateMetrics(items), [items])
  return (
    <AppPageCard cardTitle="Metrics" pageCode="metrics" pageTitle="Metrics">
      <div className="flex flex-col gap-6">
        {/* Amounts */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <MetricCard amount={metrics.totalItems} color={tw('text-purple-700')} icon={SpeedIcon} title="items registered" />
          <MetricCard amount={metrics.itemsToGive.length} color={tw('text-green-600')} icon={OutboxIcon} title="items to give" />
          <MetricCard amount={formatCurrency(metrics.totalValue)} color={tw('text-blue-600')} icon={ShoppingCartIcon} title="total value" />
        </div>
        {/* Lists */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MetricCard color={tw('text-red-600')} items={metrics.itemsNotPrinted} title={`Items not printed : ${metrics.itemsNotPrinted.length}`} />
          <MetricCard color={tw('text-red-600')} items={metrics.itemsWithoutLocation} title={`Items without location : ${metrics.itemsWithoutLocation.length}`} />
          <MetricCard color={tw('text-red-600')} items={metrics.itemsWithoutPhoto} title={`Items without photo : ${metrics.itemsWithoutPhoto.length}`} />
          <MetricCard color={tw('text-red-600')} items={metrics.itemsWithPhotoUrl} title={`Items with a photo url instead of an upload : ${metrics.itemsWithPhotoUrl.length}`} />
          <MetricCardMissingPriceList metrics={metrics} />
          <MetricCard color={tw('text-blue-700')} title="Storage locations">
            <div className="flex flex-col gap-4 p-4">
              {Object.entries(metrics.boxAnalysis)
                .toSorted((entryA, entryB) => entryA[0].localeCompare(entryB[0]))
                .map(([box, data]) => (
                  <MetricCardEntry box={box as Item['box']} count={data.count} key={box} value={formatCurrency(data.totalValue)} />
                ))}
            </div>
          </MetricCard>
          <MetricCard color={tw('text-green-700')} items={metrics.topValueItems} title={`Top ${topValueItems} most valuable`} />
          <MetricCard color={tw('text-yellow-700')} items={metrics.itemsToGive} title={`Items to give : ${metrics.itemsToGive.length}`} />
          {/* On demand check, it calls the backend for each photo */}
          <OnDemandPhotoCheck items={items} />
        </div>
      </div>
    </AppPageCard>
  )
}
