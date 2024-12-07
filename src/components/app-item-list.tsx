import { useState } from 'preact/hooks'
import type { Display } from '../types/theme.types'
import type { Item } from '../utils/parsers.utils'
import { state, watchState } from '../utils/state.utils'
import { AppItemListEntry } from './app-item-list-entry'

export function AppItemList ({ items }: Readonly<{ items: Item[] }>) {

  const [display, setDisplay] = useState<Display>(state.display)
  watchState('display', () => { setDisplay(state.display) })

  return (
    <nav aria-label="item list" class="overflow-y-auto overflow-x-hidden mb-20 md:mb-0" data-component="item-list">
      <div class={`grid grid-cols-1 bg-gray-100 ${display === 'list' ? '' : 'gap-3 p-3 xs:grid-cols-2 sm:grid-cols-3 sm:gap-5 sm:p-5'}`} data-type="list">
        {items.map(item => <AppItemListEntry display={display} item={item} key={item.id} />)}
      </div>
    </nav>
  )
}
