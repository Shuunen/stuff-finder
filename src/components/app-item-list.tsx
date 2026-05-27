import { useCallback, useMemo, useRef, useState } from 'react'
import type { Item } from '../types/item.types'
import type { Display } from '../types/theme.types'
import { state, watchState } from '../utils/state.utils'
import { AppItemListEntry } from './app-item-list-entry'

type Props = Readonly<{
  display?: Display
  items: Item[]
  loadingItemIds?: Item['$id'][]
  onSelection?: (items: Item[]) => void
  showPrice?: boolean
}>

export function AppItemList(props: Props) {
  const { display: displayProp, items, loadingItemIds, onSelection, showPrice } = props
  const loadingSet = useMemo(() => new Set(loadingItemIds), [loadingItemIds])
  const [display, setDisplay] = useState<Display>(displayProp ?? state.display)
  // handle selection
  const [, setSelection] = useState<Item[]>([])
  const selectionRef = useRef<Item[]>([])
  const onSelect = useCallback(
    (item: Item, isSelected: boolean) => {
      if (onSelection === undefined) return
      const currentSelection = selectionRef.current
      const newSelection = isSelected ? [...currentSelection, item] : currentSelection.filter(data => data.$id !== item.$id)
      selectionRef.current = newSelection
      setSelection(newSelection)
      onSelection(newSelection)
    },
    [onSelection],
  )
  // watch display state if not provided
  if (displayProp === undefined)
    watchState('display', () => {
      setDisplay(state.display)
    })
  return (
    <nav aria-label="item list" className="mb-20 overflow-x-hidden overflow-y-auto md:mb-0" data-component="item-list">
      <div className={`grid grid-cols-1 bg-gray-100 ${display === 'list' ? '' : 'gap-3 p-3 xs:grid-cols-2 sm:grid-cols-3 sm:gap-5 sm:p-5'}`} data-type="list">
        {items.map(item => (
          <AppItemListEntry display={display} isLoading={loadingSet.has(item.$id)} item={item} key={item.$id} onSelect={onSelection ? onSelect : undefined} showPrice={showPrice} />
        ))}
      </div>
    </nav>
  )
}
