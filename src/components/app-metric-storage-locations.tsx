import { invariant } from 'es-toolkit'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { computeRowMoves, playRowMoves, readRowSnapshots, type RowSnapshot } from '../pages/page-metrics.animation'
import { type BoxAnalysis, type BoxSortCriteria, sortBoxAnalysis } from '../pages/page-metrics.utils'
import { AppCard } from './app-card'
import { AppMetricSortToggle } from './app-metric-sort-toggle'
import { AppMetricStorageEntry } from './app-metric-storage-entry'

// the list starts sorted by value then sorts itself by name as soon as the card starts to fade in, so the sort animation plays when the page loads
const introDelayMs = 250

const subtitles: Record<BoxSortCriteria, string> = {
  items: 'Most items first, bars show the number of items',
  name: 'Sorted by name, bars show the number of items',
  value: 'Highest value first, bars show the value',
}

type Props = Readonly<{
  boxAnalysis: BoxAnalysis
}>

export function AppMetricStorageLocations({ boxAnalysis }: Props) {
  const [criteria, setCriteria] = useState<BoxSortCriteria>('value')
  const hasChosen = useRef(false)
  const rows = useMemo(() => sortBoxAnalysis(boxAnalysis, criteria), [boxAnalysis, criteria])
  const listRef = useRef<HTMLDivElement>(null)
  const snapshots = useRef<ReadonlyMap<string, RowSnapshot>>(new Map())
  // each time the sort changes the rows slide from their old place and the bars resize a bit later, the first render has nothing to animate from
  useLayoutEffect(() => {
    invariant(listRef.current, 'the storage list should be mounted')
    const current = readRowSnapshots(listRef.current, rows)
    playRowMoves(listRef.current, computeRowMoves(snapshots.current, current))
    snapshots.current = current
  }, [rows])
  // simulate a sort by name on load, unless the user already chose a sort
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasChosen.current) setCriteria('name')
    }, introDelayMs)
    return () => {
      clearTimeout(timer)
    }
  }, [])
  const choose = useCallback((chosen: BoxSortCriteria) => {
    hasChosen.current = true
    setCriteria(chosen)
  }, [])
  return (
    <AppCard name="metric-storage-locations" className="gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2>Storage locations</h2>
          <p className="text-sm text-grey">
            {rows.length} locations, {subtitles[criteria].toLowerCase()}
          </p>
        </div>
        <AppMetricSortToggle criteria={criteria} onChange={choose} />
      </div>
      <div className="flex flex-col gap-1" ref={listRef}>
        {rows.map(row => (
          <AppMetricStorageEntry key={row.box} row={row} />
        ))}
      </div>
    </AppCard>
  )
}
