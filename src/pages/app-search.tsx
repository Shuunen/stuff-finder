import { AppItemList } from '../components/app-item-list'
import type { Item } from '../types'
import { fakeItem } from '../utils/item.utils'

const items: Item[] = [
  fakeItem('Sécateur de ouf'),
  fakeItem('Pelle en acier trempé'),
  fakeItem('Brouette de jardin'),
]

export function AppSearch ({ input }: { readonly input: string }) {
  return (
    <div className="flex flex-col gap-6">
      <h2>Search results for &quot;{input}&quot; :</h2>
      <AppItemList items={items} />
    </div>
  )
}
