import OutboxIcon from '@mui/icons-material/Outbox'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import SpeedIcon from '@mui/icons-material/Speed'
import { Button } from '@mui/material'
import { memo, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
// oxlint-disable react/no-multi-comp
import { tw } from 'shuutils'
import { AppItemList } from '../components/app-item-list'
import { AppPageCard } from '../components/app-page-card'
import type { MuiIcon } from '../types/icons.types'
import type { Item } from '../types/item.types'
import { updateItem } from '../utils/item.utils'
import { logger } from '../utils/logger.utils'
import { state, watchState } from '../utils/state.utils'
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
  onSelection?: (items: Item[]) => void
  showPrice?: boolean
  title: string
}

const iconStyle = { fontSize: '3rem' }

const MetricCard = memo((props: MetricCardProps) => {
  const { title, color, amount, icon: Icon, items, onSelection, showPrice, children, loadingItemIds } = props
  const isHidden = items?.length === 0

  return (
    <div className={`relative flex gap-6 rounded-lg border border-gray-200 bg-white p-6 whitespace-nowrap shadow-sm ${color} ${isHidden ? 'hidden' : ''}`}>
      {amount && Icon && (
        <div className="flex items-center">
          <Icon className="opacity-30" sx={iconStyle} />
          <p className="text-3xl font-bold">{amount}</p>
        </div>
      )}
      <div className={`flex w-full flex-col ${amount ? 'justify-center' : ''}`}>
        <h2 className="text-xl font-semibold text-current">{title}</h2>
        {(children || items) && (
          <div className="max-h-96 space-y-3 overflow-y-auto">
            {items && <AppItemList display="list" items={items} loadingItemIds={loadingItemIds} onSelection={onSelection} showPrice={showPrice ?? false} />}
            {!items && children}
          </div>
        )}
        {items && children}
      </div>
    </div>
  )
})

MetricCard.displayName = 'MetricCard'

function MetricCardEntry({ title, subtitle, value }: { title: string; subtitle: string; value: string }) {
  return (
    <div className="mr-3 flex items-center justify-between rounded-md border border-gray-200 p-3">
      <div className="max-w-4/5 flex-1">
        <h4 className="truncate font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
      <p className="font-medium">{value}</p>
    </div>
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
      <p>Set price for the {label} :</p>
      <div className="flex gap-4">
        {priceList.map(price => (
          <Button key={price} onClick={() => onPriceClick(price)} variant="outlined">
            {price} €
          </Button>
        ))}
      </div>
    </>
  )
}

const MetricCardMissingPriceList = memo(({ metrics }: { metrics: MetricsData }) => {
  const [selection, setSelection] = useState<Item[]>([])
  const [itemsToDisplay, setItemsToDisplay] = useState<Item[]>(() => [...metrics.itemsWithoutPrice])
  const [loadingItemIds, setLoadingItemIds] = useState<Item['$id'][] | undefined>()

  useEffect(() => {
    if (itemsToDisplay.length === metrics.itemsWithoutPrice.length) return
    setSelection(current => filterSelectionByDisplayItems(current, itemsToDisplay))
  }, [itemsToDisplay, metrics.itemsWithoutPrice.length])

  const onSelection = useCallback((items: Item[]) => setSelection(filterSelectionByDisplayItems(items, itemsToDisplay)), [itemsToDisplay])

  const removeItemsFromLists = useCallback((itemIds: string[]) => {
    setItemsToDisplay(current => removeItemsFromList(current, itemIds))
    setSelection(current => removeItemsFromList(current, itemIds))
  }, [])

  const onPriceClick = useCallback(
    async (price: number) => {
      await updateItemsConcurrently(selection, price, { removeItemFromLists: removeItemsFromLists, setLoadingItemIds })
    },
    [selection, removeItemsFromLists],
  )

  return (
    <MetricCard color={tw('text-red-600')} items={itemsToDisplay} loadingItemIds={loadingItemIds} onSelection={onSelection} title={`Items without price : ${itemsToDisplay.length}`}>
      <PriceButtons onPriceClick={onPriceClick} selection={selection} />
    </MetricCard>
  )
})

MetricCardMissingPriceList.displayName = 'MetricCardMissingPriceList'

export function PageMetrics({ ...properties }: Readonly<Record<string, unknown>>) {
  logger.debug('PageMetrics', { properties })
  const [items, setItems] = useState(state.items)
  watchState('items', () => {
    setItems(state.items)
  })
  const metrics = useMemo(() => calculateMetrics(items), [items])
  return (
    <AppPageCard cardTitle="Metrics" pageCode="metrics" pageTitle="Metrics">
      <div className="flex flex-col">
        {/* Amounts */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <MetricCard amount={metrics.totalItems} color={tw('text-purple-700')} icon={SpeedIcon} title="items registered" />
          <MetricCard amount={metrics.itemsToGive.length} color={tw('text-green-600')} icon={OutboxIcon} title="items to give" />
          <MetricCard amount={formatCurrency(metrics.totalValue)} color={tw('text-blue-600')} icon={ShoppingCartIcon} title="total value" />
        </div>
        {/* Lists */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MetricCard color={tw('text-red-600')} items={metrics.itemsNotPrinted} title={`Items not printed : ${metrics.itemsNotPrinted.length}`} />
          <MetricCard color={tw('text-red-600')} items={metrics.itemsWithoutLocation} showPrice title={`Items without location : ${metrics.itemsWithoutLocation.length}`} />
          <MetricCard color={tw('text-red-600')} items={metrics.itemsWithoutPhoto} title={`Items without photo : ${metrics.itemsWithoutPhoto.length}`} />
          <MetricCardMissingPriceList metrics={metrics} />
          <MetricCard color={tw('text-blue-700')} title="Storage locations">
            {Object.entries(metrics.boxAnalysis)
              .toSorted((entryA, entryB) => entryA[0].localeCompare(entryB[0]))
              .map(([box, data]) => (
                <MetricCardEntry key={box} subtitle={`${data.count} items`} title={box || 'No box specified'} value={formatCurrency(data.totalValue)} />
              ))}
          </MetricCard>
          <MetricCard color={tw('text-green-700')} items={metrics.topValueItems} showPrice title={`Top ${topValueItems} most valuable`} />
          <MetricCard color={tw('text-yellow-700')} items={metrics.itemsToGive} title={`Items to give : ${metrics.itemsToGive.length}`} />
        </div>
      </div>
    </AppPageCard>
  )
}
