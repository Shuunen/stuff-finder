import type { Item } from '../types/item.types'
import { AppCard } from './app-card'
import { AppMetricItemEntry } from './app-metric-item-entry'

type Props = Readonly<{
  items: Item[]
}>

export function AppMetricItemsToGive({ items }: Props) {
  if (items.length === 0) return undefined
  return (
    <AppCard name="metric-items-to-give" className="animate-fade-up gap-4 [animation-delay:400ms]">
      <h2>Items to give : {items.length}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" data-testid="metric-items-to-give-grid">
        {items.map(item => (
          <AppMetricItemEntry item={item} key={item.$id} />
        ))}
      </div>
    </AppCard>
  )
}
