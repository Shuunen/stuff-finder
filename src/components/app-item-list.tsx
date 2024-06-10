import { useState } from 'preact/hooks'
import type { Display } from '../types/theme.types'
import type { Item } from '../utils/parsers.utils'
import { state, watchState } from '../utils/state.utils'
import { AppItemListEntry } from './app-item-list-entry'

export function AppItemList ({ items }: Readonly<{ items: Item[] }>) {

  const [display, setDisplay] = useState<Display>(state.display)
  watchState('display', () => { setDisplay(state.display) })

  return (
    <nav aria-label="item list" className="overflow-y-auto overflow-x-hidden md:min-w-[34rem]" data-component="item-list">
      <div className={`grid bg-gray-100 ${display === 'list' ? 'grid-cols-1' : 'grid-cols-3 gap-5 p-5'}`}>
        {items.map(item => <AppItemListEntry display={display} item={item} key={item.id} />)}
      </div>
    </nav>
  )
}
