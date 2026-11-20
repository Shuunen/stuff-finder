// oxlint-disable react/no-multi-comp
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import OutboxIcon from '@mui/icons-material/Outbox'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import SpeedIcon from '@mui/icons-material/Speed'
import { kebabCase } from 'es-toolkit'
import { memo, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { tw } from 'shuutils'
import { AppButton } from '../components/app-button'
import { AppCard } from '../components/app-card'
import { AppFadeUp } from '../components/app-fade-up'
import { AppItemList } from '../components/app-item-list'
import { AppMetricItemsToGive } from '../components/app-metric-items-to-give'
import { AppMetricStat } from '../components/app-metric-stat'
import { AppMetricStorageLocations } from '../components/app-metric-storage-locations'
import { AppMetricTopItems } from '../components/app-metric-top-items'
import { AppPageCard } from '../components/app-page-card'
import type { Item } from '../types/item.types'
import { updateItem } from '../utils/item.utils'
import { logger } from '../utils/logger.utils'
import { state, watchState } from '../utils/state.utils'
import { findItemsWithBrokenPhoto } from './page-metrics.broken-photos'
import { calculateMetrics, formatCurrency, type MetricsData } from './page-metrics.utils'

// oxlint-disable-next-line no-magic-numbers
const priceList = [1, 2, 5, 10, 20, 50, 100, 200] as const

type MetricCardProps = {
  children?: ReactNode
  color: string
  items?: Item[]
  loadingItemIds?: Item['$id'][]
  title: string
}

function MetricCardComponent(props: MetricCardProps) {
  const { title, color, items, children, loadingItemIds } = props
  const isHidden = items?.length === 0

  return (
    <div data-testid={kebabCase(`metric-card-${title.split(' :')[0]}`)} className={`relative flex gap-4 rounded-lg border border-black/20 bg-white p-6 whitespace-nowrap shadow-sm ${color} ${isHidden ? 'hidden' : ''}`}>
      <div className="flex w-full flex-col gap-2">
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
    <AppCard name="metric-data-health" className="gap-3 bg-pastel-1">
      <h2>Data health</h2>
      <p className="text-sm">Checks every photo and lists the ones that fail to load.</p>
      <div>
        <AppButton name="check-photos" label="Check photos that fail to load" onClick={start} />
      </div>
    </AppCard>
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
    <AppPageCard cardTitle="Metrics" hasCard={false} pageCode="metrics" pageTitle="Metrics">
      <div className="flex w-full flex-col gap-6">
        {/* Amounts */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <AppFadeUp delay={0}>
            <AppMetricStat amount={metrics.totalItems} background={tw('bg-pastel-6')} icon={SpeedIcon} label="items registered" />
          </AppFadeUp>
          <AppFadeUp delay={80}>
            <AppMetricStat amount={metrics.itemsToGive.length} background={tw('bg-pastel-2')} icon={OutboxIcon} label="items to give" />
          </AppFadeUp>
          <AppFadeUp delay={160}>
            <AppMetricStat amount={formatCurrency(metrics.totalValue)} background={tw('bg-pastel-3')} icon={ShoppingCartIcon} label="total value" />
          </AppFadeUp>
          <AppFadeUp delay={240}>
            <AppMetricStat amount={`≈ ${formatCurrency(metrics.averageValue)}`} background={tw('bg-pastel-1')} icon={LocalOfferIcon} label="avg. per item" />
          </AppFadeUp>
        </div>
        {/* Storage locations, most valuable items and data health */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
          <AppFadeUp className="lg:col-span-3" delay={200}>
            <AppMetricStorageLocations boxAnalysis={metrics.boxAnalysis} />
          </AppFadeUp>
          <AppFadeUp className="flex flex-col gap-6 lg:col-span-2" delay={300}>
            <AppMetricTopItems items={metrics.topValueItems} />
            {/* On demand check, it calls the backend for each photo */}
            <OnDemandPhotoCheck items={items} />
          </AppFadeUp>
        </div>
        <AppMetricItemsToGive items={metrics.itemsToGive} />
        {/* Things to fix, each list is hidden when it is empty */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MetricCard color={tw('text-red-600')} items={metrics.itemsNotPrinted} title={`Items not printed : ${metrics.itemsNotPrinted.length}`} />
          <MetricCard color={tw('text-red-600')} items={metrics.itemsWithoutLocation} title={`Items without location : ${metrics.itemsWithoutLocation.length}`} />
          <MetricCard color={tw('text-red-600')} items={metrics.itemsWithoutPhoto} title={`Items without photo : ${metrics.itemsWithoutPhoto.length}`} />
          <MetricCard color={tw('text-red-600')} items={metrics.itemsWithPhotoUrl} title={`Items with a photo url instead of an upload : ${metrics.itemsWithPhotoUrl.length}`} />
          <MetricCardMissingPriceList metrics={metrics} />
        </div>
      </div>
    </AppPageCard>
  )
}
