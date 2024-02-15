import SearchIcon from '@mui/icons-material/Search'
import { useSignalEffect } from '@preact/signals'
import Fuse from 'fuse.js'
import { route } from 'preact-router'
import { useState } from 'preact/hooks'
import { debounce, ellipsis, sanitize } from 'shuutils'
import { AppItemList } from '../components/app-item-list'
import { AppPageCard } from '../components/app-page-card'
import { defaultItems, delays, fuseOptions } from '../constants'
import { logger } from '../utils/logger.utils'
import { state, watchState } from '../utils/state.utils'

const maxNameLength = 20

function search (input: string) {
  logger.debug('search, input', { input })
  const fuse = new Fuse(state.items, fuseOptions)
  const result = state.items.find(item => item.reference === input || item.barcode === input)
  if (result !== undefined) { route(`/item/details/${result.id}/single`); return { header: '', results: [] } }
  const results = fuse.search(sanitize(input)).map(item => item.item)
  const header = `${results.length} results found for “${input}”`
  return { header, results }
}

export function PageSearch ({ input = '', ...properties }: { readonly input?: string; readonly [key: string]: unknown }) {
  logger.debug('PageSearch rendering', { input, properties })
  const [items, setItems] = useState(defaultItems)
  const [title, setTitle] = useState('Searching...')

  function triggerSearchSync () {
    const { header, results } = search(input)
    setItems(results)
    setTitle(header)
  }

  const triggerSearch = debounce(triggerSearchSync, delays.large)

  useSignalEffect(() => { triggerSearchSync() })

  if (items.length === 1) route(`/item/details/${items[0]?.id ?? ''}/single`)
  else watchState('items', () => { void triggerSearch() })

  return (
    <AppPageCard cardTitle="Search" icon={SearchIcon} pageCode="search" pageTitle={`Search for “${ellipsis(input, maxNameLength)}”`}>
      <div className="flex h-5/6 grow flex-col justify-start">
        <h2>{title}</h2>
        <AppItemList items={items} />
      </div>
    </AppPageCard>
  )
}
