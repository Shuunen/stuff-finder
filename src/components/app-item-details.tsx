import LocationOnIcon from '@mui/icons-material/LocationOn'
import PrintIcon from '@mui/icons-material/Print'
import { useCallback, useMemo } from 'preact/hooks'
import { deleteItem, itemToImageUrl, itemToLocation, onItemImageError } from '../utils/item.utils'
import { logger } from '../utils/logger.utils'
import type { Item } from '../utils/parsers.utils'
import { state } from '../utils/state.utils'
import { AppButtonEdit } from './app-button-edit'
import { AppDeleteRessource } from './app-delete-ressource'
import { AppItemDetailsChip } from './app-item-details-chip'

// eslint-disable-next-line complexity
export function AppItemDetails ({ item }: Readonly<{ item: Item }>) {

  const onDelete = useCallback(async () => {
    logger.debug('deleting item', item)
    const result = await deleteItem(item.id)
    const isOk = result.success
    state.message = { content: isOk ? 'Item deleted' : 'Item deletion failed', type: isOk ? 'success' : 'error' }
    if (isOk) globalThis.history.back()
  }, [item])

  const itemLocation = useMemo(() => itemToLocation(item), [item])

  return (
    <div class="flex flex-col sm:flex-row items-center">
      <div class="absolute flex flex-col items-end gap-1 right-5 top-5 transition-opacity hover:opacity-85">
        <AppDeleteRessource onDelete={onDelete} />
        <AppButtonEdit itemId={item.id} />
      </div>
      <div class="relative flex aspect-square w-full min-w-40 max-w-[40vh] flex-col md:w-1/3 md:min-w-64 md:max-w-[40vh]">
        <img alt={item.name} class="absolute top-0 size-full object-contain md:p-4" data-id={item.id} onError={onItemImageError} src={itemToImageUrl(item)} />
      </div>
      <div class="mb-12 flex min-w-80 flex-col items-start justify-start gap-3 sm:mb-0 sm:mr-6 md:w-2/3">
        <h1>{item.name} {item.brand}</h1>
        <h2>{item.category}</h2>
        {Boolean(item.details) && <p class="first-letter:uppercase">{item.details}</p>}
        <div class="my-2 flex gap-3">
          <LocationOnIcon className="text-purple-600" /><div class="font-medium">{itemLocation || 'Unknown'}</div>
        </div>
        <div class="flex flex-wrap justify-start gap-3">
          {Boolean(item.brand) && <AppItemDetailsChip label={item.brand} link={`/search/${item.brand}`} tooltip="Brand, click to search" />}
          {Boolean(item.price) && <AppItemDetailsChip label={`${item.price ?? '?'} €`} tooltip="Price, click to copy" />}
          {Boolean(item.reference) && <AppItemDetailsChip label={item.reference} tooltip="Reference, click to copy" />}
          {Boolean(item.barcode) && <AppItemDetailsChip label={item.barcode} tooltip="Barcode, click to copy" />}
          {Boolean(item.status) && <AppItemDetailsChip label={item.status} tooltip="Status, click to copy" />}
          <AppItemDetailsChip color="primary" icon={PrintIcon} label={item['ref-printed'] ? 'printed' : 'not printed'} link={`/item/print/${item.id}`} tooltip="Click to print" />
        </div>
      </div>
    </div>
  )
}
