import { AppItemList } from '../components/app-item-list'
import { fakeItem } from '../utils/item.utils'
import { logger } from '../utils/logger.utils'

const items = [
  fakeItem('Sécateur de ouf'),
  fakeItem('Pelle en acier trempé'),
  fakeItem('Brouette de jardin'),
]

export function PageSearch ({ input = '', ...properties }: { readonly input?: string; readonly [key: string]: unknown }) {
  logger.debug('PageSearch', { input, properties })
  return (
    <div className="flex flex-col gap-6" data-page="search">
      <h2>Found {items.length} search results for &quot;{input}&quot; :</h2>
      <AppItemList items={items} />
    </div>
  )
}
