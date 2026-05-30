import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import PrintIcon from '@mui/icons-material/Print'
import { useMemo } from 'react'
import { cn } from 'shuutils'
import type { Item } from '../types/item.types'
import { itemToImageUrl } from '../utils/database.utils'
import { itemToLocation } from '../utils/item.utils'
import { navigate } from '../utils/navigation.utils'
import { AppItemDetailsActions } from './app-item-details-actions'
import { AppLocSticker } from './app-loc-sticker'

const squiggleCtrl1 = 0.15
const squiggleAnchor1 = 0.3
const squiggleAnchor2 = 0.6
const squiggleAnchor3 = 0.9
const squiggleEndPad = 2
const squiggleWidth = 120

const statusColors: Record<string, string> = {
  bought: 'var(--color-pastel-2)',
  'for-sell': 'var(--color-pastel-1)',
  lost: 'var(--color-pastel-4)',
  'to-give': 'var(--color-pastel-3)',
}

function squiggleSvg(width: number) {
  const cp1 = width * squiggleCtrl1
  const an1 = width * squiggleAnchor1
  const an2 = width * squiggleAnchor2
  const an3 = width * squiggleAnchor3
  const endX = width - squiggleEndPad
  return (
    <svg height="8" viewBox={`0 0 ${width} 8`} width={width}>
      <path d={`M2 5 Q ${cp1} 1, ${an1} 5 T ${an2} 5 T ${an3} 5 L ${endX} 5`} fill="none" stroke="var(--color-primary)" strokeLinecap="round" strokeWidth="2" />
    </svg>
  )
}

function renderMetaTags(item: Item) {
  const baseClasses = cn('shadow-chunky rounded-full border border-grey px-4 py-1 font-semibold')
  return (
    <div className="flex flex-wrap gap-2" data-testid="item-detail-meta">
      {item.price > 0 && <div className={cn(baseClasses, 'bg-pastel-1')}>€{item.price}</div>}
      {item.barcode.length > 0 && <div className={cn(baseClasses, 'bg-white')}>{item.barcode}</div>}
      {item.reference.length > 0 && <div className={cn(baseClasses, 'bg-white')}>{item.reference}</div>}
      {item.status.length > 0 && (
        <div className={cn(baseClasses)} style={{ background: statusColors[item.status] }}>
          {item.status}
        </div>
      )}
      <div className={cn(baseClasses, 'bg-pastel-6')}>{item.isPrinted ? 'printed' : 'not printed'}</div>
    </div>
  )
}

function renderActionButtons(item: Item) {
  return (
    <div className="mt-6 flex justify-center gap-3" data-testid="item-detail-actions">
      <button className="sf-chunky-btn" onClick={() => navigate(`/item/edit/${item.$id}`)} type="button">
        <EditOutlinedIcon />
        Edit
      </button>
      <button className="sf-chunky-btn bg-pastel-6" onClick={() => navigate(`/item/print/${item.$id}`)} type="button">
        Print label
        <PrintIcon />
      </button>
    </div>
  )
}

export function AppItemDetails({ item }: Readonly<{ item: Item }>) {
  const itemLocation = useMemo(() => itemToLocation(item), [item])
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6" data-component="item-details">
      <AppItemDetailsActions item={item} />
      <div className="relative px-1 pt-2">
        <div className="relative rounded-2xl border-2 bg-white p-3" style={{ boxShadow: '4px 4px 0 var(--color-black)' }}>
          <img alt={item.name} className="w-full rounded-xl object-contain" data-testid="item-detail-image" loading="lazy" src={itemToImageUrl(item)} style={{ aspectRatio: '4/3', maxHeight: 260 }} />
          <div className="sf-tape" style={{ left: 18, top: -10, transform: 'rotate(-6deg)', width: 64 }} />
          <div className="sf-tape bg-pastel-1" style={{ right: 24, top: -8, transform: 'rotate(5deg)', width: 54 }} />
        </div>
        <div className="absolute -top-1 -right-2">
          <AppLocSticker box={item.box} drawer={item.drawer} rotate={6} size="lg" />
        </div>
      </div>
      <div className="flex flex-col gap-3 px-2">
        <div className="font-mono font-semibold text-grey uppercase">{[item.brand, itemLocation].filter(Boolean).join(' · ')}</div>
        <div>
          <h1 className="text-4xl font-extrabold" style={{ letterSpacing: '-0.5px' }}>
            {item.name}
          </h1>
          <div className="mt-2">{squiggleSvg(squiggleWidth)}</div>
        </div>
        {Boolean(item.details) && <p className="text-grey">{item.details}</p>}
        {renderMetaTags(item)}
      </div>
      {renderActionButtons(item)}
    </div>
  )
}
