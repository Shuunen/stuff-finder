import LocationOnIcon from '@mui/icons-material/LocationOn'
import PrintIcon from '@mui/icons-material/Print'
import { useMemo } from 'preact/hooks'
import type { Item } from '../types/item.types'
import { itemToImageUrl } from '../utils/database.utils'
import { itemToLocation } from '../utils/item.utils'
import { AppItemDetailsActions } from './app-item-details-actions'
import { AppItemDetailsChip } from './app-item-details-chip'

export function AppItemDetails ({ item }: Readonly<{ item: Item }>) {

  const itemLocation = useMemo(() => itemToLocation(item), [item])

  return (
    <div class="flex flex-col items-center sm:flex-row">
      <div class="absolute right-5 top-5 flex flex-col items-end gap-1 transition-opacity hover:opacity-85">
        <AppItemDetailsActions item={item} />
      </div>
      <div class="relative flex aspect-square w-full min-w-40 max-w-[40vh] flex-col md:min-w-64 md:max-w-72">
        <img alt={item.name} class="absolute top-0 size-full object-contain md:p-4" data-test="item-detail-image" loading="lazy" src={itemToImageUrl(item)} />
      </div>
      <div class="mb-12 flex min-w-96 flex-col items-start justify-start gap-3 sm:mb-0 sm:mr-6">
        <h1>{item.name} {item.brand}</h1>
        {Boolean(item.details) && <p class="first-letter:uppercase">{item.details}</p>}
        <div class="my-2 flex gap-3">
          <LocationOnIcon className="text-purple-600" /><div class="font-medium">{itemLocation || 'Unknown'}</div>
        </div>
        <div class="flex flex-wrap justify-start gap-3 md:flex-nowrap">
          {item.brand.length > 0 && <AppItemDetailsChip label={item.brand} link={`/search/${item.brand}`} tooltip="Brand, click to search" />}
          {item.price > 0 && <AppItemDetailsChip label={`${item.price} €`} tooltip="Price, click to copy" />}
          {item.reference.length > 0 && <AppItemDetailsChip label={item.reference} tooltip="Reference, click to copy" />}
          {item.barcode.length > 0 && <AppItemDetailsChip label={item.barcode} tooltip="Barcode, click to copy" />}
          {item.status.length > 0 && <AppItemDetailsChip label={item.status} tooltip="Status, click to copy" />}
          <AppItemDetailsChip color="primary" icon={PrintIcon} label={item.isPrinted ? 'printed' : 'not printed'} link={`/item/print/${item.$id}`} tooltip="Click to print" />
        </div>
      </div>
    </div>
  )
}
