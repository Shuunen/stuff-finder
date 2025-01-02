import SearchIcon from '@mui/icons-material/Search'
import { route } from 'preact-router'
import { ellipsis } from 'shuutils'
import { AppButtonNext } from '../components/app-button-next'
import { AppDisplayToggle } from '../components/app-display-toggle'
import { AppItemList } from '../components/app-item-list'
import { AppPageCard } from '../components/app-page-card'
import { logger } from '../utils/logger.utils'
import { maxNameLength, search } from './page-search.const'

export function PageSearch ({ input = '' }: Readonly<{ [key: string]: unknown; input?: string }>) {
  const { header, results } = search(input)
  logger.debug(`PageSearch found ${results.length} results`)
  if (results.length === 1) route(`/item/details/${results[0]?.id ?? ''}/single`)
  return (
    <AppPageCard cardTitle="Search" icon={SearchIcon} pageCode="search" pageTitle={`Search for “${ellipsis(input, maxNameLength)}”`}>
      <div class="flex max-h-[90%] md:max-h-full flex-col gap-3 sm:gap-5 items-center">
        <h2 class="text-center">{header}</h2>
        {results.length > 0 && <div class="absolute right-7 top-7"><AppDisplayToggle /></div>}
        <AppItemList items={results} />
        {results.length === 0 && <AppButtonNext label='Add a product' url={`/item/add/${input}`} />}
      </div>
    </AppPageCard>
  )
}
