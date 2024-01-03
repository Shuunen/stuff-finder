import LocationOnIcon from '@mui/icons-material/LocationOn'
import PrintIcon from '@mui/icons-material/Print'
import type { Item } from '../types/item.types'
import { itemToImageUrl, onItemImageError } from '../utils/item.utils'
import { AppItemDetailsChip } from './app-item-details-chip'

export function AppItemDetails ({ item }: { readonly item: Item }) {
  return (
    <>
      <div className="relative flex aspect-square w-full min-w-[10rem] max-w-[30vh] flex-col md:w-1/3 md:min-w-[16rem] md:max-w-[40vh]">
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <img alt={item.name} className="absolute top-0 h-full w-full object-contain md:p-4" data-id={item.id} onError={onItemImageError} src={itemToImageUrl(item)} />
      </div>
      <div className="flex flex-col items-start justify-start gap-3 md:w-2/3">
        <h1>{item.name}</h1>
        <h2>{item.brand ? `${item.brand} - ` : ''}{item.category}</h2>
        {Boolean(item.details) && <p className="first-letter:uppercase">{item.details}</p>}
        <div className="my-2 flex gap-3">
          {/* eslint-disable-next-line react/forbid-component-props */}
          <LocationOnIcon className="text-purple-600" /><div className="font-medium">{item.location} {item.box} {item.drawer}</div>
        </div>
        <div className="flex flex-wrap justify-start gap-3">
          {Boolean(item.price) && <AppItemDetailsChip label={`${item.price ?? '?'} €`} tooltip="Price" />}
          {Boolean(item.reference) && <AppItemDetailsChip label={item.reference} tooltip="Reference" />}
          {Boolean(item.barcode) && <AppItemDetailsChip label={item.barcode} tooltip="Barcode" />}
          {Boolean(item.status) && <AppItemDetailsChip label={item.status} tooltip="Status" />}
          {Boolean(item['ref-printed']) && <AppItemDetailsChip color="primary" icon={PrintIcon} label={item['ref-printed'] ? 'printed' : 'not printed'} link={`/item/print/${item.id}`} tooltip="Print it !" />}
        </div>
      </div>
    </>
  )
}
