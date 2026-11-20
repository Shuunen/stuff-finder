import { useMemo, useState } from 'react'
import type { Item } from '../types/item.types'
import type { Display } from '../types/theme.types'
import { cn } from '../utils/class.utils'
import { state, watchState } from '../utils/state.utils'
import { AppItemListEntry } from './app-item-list-entry'

type Props = Readonly<{
  className?: string
  display?: Display
  items: Item[]
  loadingItemIds?: Item['$id'][]
}>

export function AppItemList(props: Props) {
  const { className, display: displayProp, items, loadingItemIds } = props
  const loadingSet = useMemo(() => new Set(loadingItemIds), [loadingItemIds])
  const [display, setDisplay] = useState<Display>(displayProp ?? state.display)
  // watch display state if not provided
  if (displayProp === undefined)
    watchState('display', () => {
      setDisplay(state.display)
    })
  return (
    <nav aria-label="item list" className={cn('flex grow flex-col overflow-x-hidden overflow-y-auto p-4', className ?? 'mb-22 md:mb-26')} data-component="item-list" data-testid="app-item-list">
      <div className={cn(display === 'card' ? 'columns-1 gap-6 md:columns-2 lg:columns-3 xl:columns-4' : '')} data-testid="app-item-list-entries" data-type="list">
        {items.map((item, index) => (
          <AppItemListEntry className={cn(index < items.length - 1 && (display === 'card' ? 'mb-6' : 'mb-4'))} display={display} index={index} isLoading={loadingSet.has(item.$id)} item={item} key={item.$id} />
        ))}
      </div>
    </nav>
  )
}
