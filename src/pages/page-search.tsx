import { useSignalEffect } from '@preact/signals'
import Fuse from 'fuse.js'
import { useState } from 'preact/hooks'
import { sanitize } from 'shuutils'
import { AppItemList } from '../components/app-item-list'
import { fuseOptions } from '../constants'
import { defaultItems } from '../types/item.types'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

function search (input: string) {
  const fuse = new Fuse(state.items, fuseOptions)
  const result = state.items.find(item => item.reference === input || item.barcode === input)
  const results = result ? [result] : fuse.search(sanitize(input)).map(item => item.item)
  let header = 'No results found'
  if (results.length > 0) header = results.length === 1 ? 'One result found' : `${results.length} results found`
  header += ` for “${input}”`
  return { header, results }
}

export function PageSearch ({ input = '', ...properties }: { readonly input?: string; readonly [key: string]: unknown }) {
  logger.debug('PageSearch rendering', { input, properties })
  const [items, setItems] = useState(defaultItems)
  const [title, setTitle] = useState('Searching...')
  useSignalEffect(() => {
    logger.debug('PageSearch is mounted')
    const { header, results } = search(input)
    setItems(results)
    setTitle(header)
  })

  return (
    <div className="flex max-h-full grow flex-col justify-center gap-6" data-page="search">
      <h1>Search</h1>
      <h2>{title}</h2>
      <AppItemList items={items} />
    </div>
  )
}
