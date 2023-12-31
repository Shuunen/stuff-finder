import SearchIcon from '@mui/icons-material/Search'
import { useSignalEffect } from '@preact/signals'
import Fuse from 'fuse.js'
import { route } from 'preact-router'
import { useState } from 'preact/hooks'
import { ellipsis, sanitize } from 'shuutils'
import { AppItemList } from '../components/app-item-list'
import { AppPageBottom } from '../components/app-page-bottom'
import { fuseOptions } from '../constants'
import { defaultItems } from '../types/item.types'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

const maxNameLength = 20

function search (input: string) {
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
  setTitle(`Search for “${ellipsis(input, maxNameLength)}”`)
  useSignalEffect(() => {
    logger.debug('PageSearch is mounted')
    const { header, results } = search(input)
    setItems(results)
    setTitle(header)
  })

  return (
    <div className="flex max-h-full grow flex-col" data-page="search">
      <h1>Search</h1>
      <h2>{title}</h2>
      <AppItemList items={items} />
      <AppPageBottom icon={SearchIcon} />
    </div>
  )
}
