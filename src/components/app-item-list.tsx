import List from '@mui/material/List'
import type { Item } from '../types/item.types'
import { AppItemListEntry } from './app-item-list-entry'

export function AppItemList ({ items }: { readonly items: Item[] }) {
  return (
    <nav aria-label="item list" className="overflow-y-auto overflow-x-hidden md:min-w-[34rem]" data-component="item-list">
      <List>
        {/* @ts-expect-error typings issue */}
        {items.map(item => <AppItemListEntry item={item} key={item.id} />)}
      </List>
    </nav>
  )
}
