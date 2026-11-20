import { type MouseEvent, useCallback } from 'react'
import { formatCurrency, type BoxRow } from '../pages/page-metrics.utils'
import type { Item } from '../types/item.types'
import { boxToColor } from '../utils/box.utils'
import { navigate } from '../utils/navigation.utils'
import { AppLocSticker } from './app-loc-sticker'

type Props = Readonly<{
  row: BoxRow
}>

export function AppMetricStorageEntry({ row }: Props) {
  const box = row.box as Item['box']
  const url = `/box/${encodeURIComponent(box)}`
  const goToBox = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
      navigate(url)
    },
    [url],
  )
  return (
    <a className="grid grid-cols-[12rem_minmax(0,1fr)_5rem] items-center gap-4 rounded-lg p-1 transition hover:bg-pastel-1/20" data-box={row.box} data-testid="metric-entry-link" href={url} onClick={goToBox}>
      <AppLocSticker box={box} hideParentheses />
      <div aria-hidden="true" className="h-6 rounded-md border-2" data-testid="metric-entry-bar" style={{ background: boxToColor(box), width: `${row.barPercent}%` }} />
      <div className="text-right">
        <p className="font-medium">{formatCurrency(row.totalValue)}</p>
        <p className="text-sm text-grey">
          {row.count} {row.count === 1 ? 'item' : 'items'}
        </p>
      </div>
    </a>
  )
}
