import SearchIcon from '@mui/icons-material/Search'
import Fuse from 'fuse.js'
import { route } from 'preact-router'
import { ellipsis, sanitize } from 'shuutils'
import { AppButtonNext } from '../components/app-button-next'
import { AppDisplayToggle } from '../components/app-display-toggle'
import { AppItemList } from '../components/app-item-list'
import { AppPageCard } from '../components/app-page-card'
import { fuseOptions } from '../constants'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

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

export function PageSearch ({ input = '' }: Readonly<{ [key: string]: unknown; input?: string }>) {
  const { header, results } = search(input)
  logger.debug(`PageSearch found ${results.length} results`)
  if (results.length === 1) route(`/item/details/${results[0]?.id ?? ''}/single`)
  return (
    <AppPageCard cardTitle="Search" icon={SearchIcon} pageCode="search" pageTitle={`Search for “${ellipsis(input, maxNameLength)}”`}>
      <div className="flex h-5/6 grow flex-col justify-start">
        <h2>{header}</h2>
        <div className="absolute right-7"><AppDisplayToggle /></div>
        <AppItemList items={results} />
        {results.length === 0 && <AppButtonNext label='Add a product' url={`/item/add/${input}`} />}
      </div>
    </AppPageCard>
  )
}
