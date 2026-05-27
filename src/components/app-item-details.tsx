import LocationOnIcon from '@mui/icons-material/LocationOn'
import PrintIcon from '@mui/icons-material/Print'
import { useMemo } from 'react'
import type { Item } from '../types/item.types'
import { itemToImageUrl } from '../utils/database.utils'
import { itemToLocation } from '../utils/item.utils'
import { AppItemDetailsActions } from './app-item-details-actions'
import { AppItemDetailsChip } from './app-item-details-chip'

export function AppItemDetails({ item }: Readonly<{ item: Item }>) {
  const itemLocation = useMemo(() => itemToLocation(item), [item])

  return (
    <div className="flex flex-col items-center sm:flex-row">
      <div className="absolute top-5 right-5 flex flex-col items-end gap-1 transition-opacity hover:opacity-85">
        <AppItemDetailsActions item={item} />
      </div>
      <div className="relative flex aspect-square w-full max-w-[40vh] min-w-40 flex-col md:max-w-72 md:min-w-64">
        <img alt={item.name} className="absolute top-0 size-full object-contain md:p-4" data-test="item-detail-image" loading="lazy" src={itemToImageUrl(item)} />
      </div>
      <div className="mb-12 flex min-w-96 flex-col items-start justify-start gap-3 sm:mr-6 sm:mb-0">
        <h1>
          {item.name} {item.brand}
        </h1>
        {Boolean(item.details) && <p className="first-letter:uppercase">{item.details}</p>}
        <div className="my-2 flex gap-3">
          <LocationOnIcon className="text-purple-600" />
          <div className="font-medium">{itemLocation || 'Unknown'}</div>
        </div>
        <div className="flex flex-wrap justify-start gap-3 md:flex-nowrap">
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
