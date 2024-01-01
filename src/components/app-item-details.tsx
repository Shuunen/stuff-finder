import LocationOnIcon from '@mui/icons-material/LocationOn'
import PrintIcon from '@mui/icons-material/Print'
import type { Item } from '../types/item.types'
import { itemToImageUrl, onItemImageError } from '../utils/item.utils'
import { AppButtonBack } from './app-button-back'
import { AppButtonNext } from './app-button-next'
import { AppItemDetailsChip } from './app-item-details-chip'

export function AppItemDetails ({ item }: { readonly item: Item }) {
  return <div className="relative flex w-full max-w-4xl grow flex-col justify-start gap-3 bg-white p-4 md:grow-0 md:flex-row md:gap-6 md:overflow-hidden md:rounded-md md:p-8 md:shadow-md" data-component="item-details">
    <div className="flex w-full justify-between p-8 md:hidden">
      <AppButtonBack />
      <AppButtonNext label="Edit" url={`/item/edit/${item.id}`} />
    </div>
    <div className="relative flex aspect-square w-full min-w-[10rem] max-w-[30vh] flex-col md:w-1/3 md:min-w-[16rem] md:max-w-[40vh]">
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <img alt={item.name} className="absolute top-0 h-full w-full object-contain md:p-4" data-id={item.id} onError={onItemImageError} src={itemToImageUrl(item)} />
      A</div>
    <div className="flex flex-col items-start justify-start gap-3 md:w-2/3">
      <h3>{item.category}</h3>
      <h1 className="mb-2">{item.name}</h1>
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
  </div>
}
