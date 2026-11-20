import { topValueItems } from '../pages/page-metrics.utils'
import type { Item } from '../types/item.types'
import { AppCard } from './app-card'
import { AppMetricItemEntry } from './app-metric-item-entry'

type Props = Readonly<{
  /** Items sorted from the most valuable one */
  items: Item[]
}>

export function AppMetricTopItems({ items }: Props) {
  if (items.length === 0) return undefined
  return (
    <AppCard name="metric-top-items" className="gap-4">
      <div>
        <h2>Top {topValueItems} most valuable</h2>
        <p className="text-sm text-grey">Ranked by price</p>
      </div>
      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <AppMetricItemEntry item={item} key={item.$id} rank={index + 1} />
        ))}
      </div>
    </AppCard>
  )
}
