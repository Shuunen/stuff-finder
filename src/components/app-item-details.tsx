import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import PrintIcon from '@mui/icons-material/Print'
import { useMemo } from 'react'
import type { Item } from '../types/item.types'
import { itemToImageUrl } from '../utils/database.utils'
import { itemToLocation } from '../utils/item.utils'
import { navigate } from '../utils/navigation.utils'
import { AppButton } from './app-button'
import { AppButtonBack } from './app-button-back'
import { AppItemDetailsActions } from './app-item-details-actions'
import { AppLocSticker } from './app-loc-sticker'
import { AppPill } from './app-pill'
import { AppTape } from './app-tape'
import { AppWave } from './app-wave'

function renderMetaTags(item: Item) {
  return (
    <div className="flex flex-wrap gap-2" data-testid="item-detail-meta">
      {item.price > 0 && (
        <AppPill name="price" shallow>
          €{item.price}
        </AppPill>
      )}
      {item.barcode.length > 0 && (
        <AppPill name="barcode" shallow>
          {item.barcode}
        </AppPill>
      )}
      {item.reference.length > 0 && (
        <AppPill name="reference" shallow>
          {item.reference}
        </AppPill>
      )}
      {item.status.length > 0 && (
        <AppPill name="status" shallow>
          {item.status}
        </AppPill>
      )}
      <AppPill name="print-status" shallow>
        {item.isPrinted ? 'printed' : 'not printed'}
      </AppPill>
    </div>
  )
}

function renderTopActionButtons(item: Item, stepsBack?: number) {
  return (
    <div className="my-8 flex justify-between px-1">
      <AppButtonBack stepsBack={stepsBack} />
      <AppItemDetailsActions item={item} />
    </div>
  )
}

function renderVisual(item: Item) {
  return (
    <div className="relative px-1 pt-2">
      <AppPill name="visual" className="relative w-full rounded-xl bg-white p-3">
        <img alt={item.name} className="max-h-65 w-full rounded-xl object-contain md:max-h-120" data-testid="item-detail-image" loading="lazy" src={itemToImageUrl(item)} style={{ aspectRatio: '4/3' }} />
        <AppTape className="absolute -top-8 left-1/3 w-42 -rotate-6" />
      </AppPill>
      <div className="absolute -top-3 right-0 xs:-right-4">
        <AppLocSticker box={item.box} drawer={item.drawer} rotate={6} />
      </div>
    </div>
  )
}

function renderBottomActionButtons(item: Item) {
  return (
    <div className="mt-6 flex justify-center gap-3" data-testid="item-detail-actions">
      <AppButton label="Edit" name="edit" onClick={() => navigate(`/item/edit/${item.$id}`)} startIcon={<EditOutlinedIcon />} />
      <AppButton color="pastel-6" label="Print label" name="print-label" onClick={() => navigate(`/item/print/${item.$id}`)} endIcon={<PrintIcon />} />
    </div>
  )
}

export function AppItemDetails({ item, stepsBack }: Readonly<{ item: Item; stepsBack?: number }>) {
  const itemLocation = useMemo(() => itemToLocation(item), [item])
  return (
    <div className="flex flex-col gap-6" data-component="item-details">
      {renderTopActionButtons(item, stepsBack)}
      {renderVisual(item)}
      <AppPill name="item-details" className="mt-6 ml-2 flex flex-col items-start gap-3 rounded-xl bg-white px-6 py-8">
        <AppTape className="absolute -top-8 left-1/2 w-36 rotate-3 bg-pastel-1!" />
        <em>{[item.brand, itemLocation].filter(Boolean).join(' · ')}</em>
        <div>
          <h1>{item.name}</h1>
          <AppWave className="mt-2" />
        </div>
        <p>{item.details}</p>
        {renderMetaTags(item)}
      </AppPill>
      {renderBottomActionButtons(item)}
    </div>
  )
}
