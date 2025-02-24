import SearchIcon from '@mui/icons-material/Search'
import { route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import { ellipsis } from 'shuutils'
import { AppButtonNext } from '../components/app-button-next'
import { AppDisplayToggle } from '../components/app-display-toggle'
import { AppItemList } from '../components/app-item-list'
import { AppPageCard } from '../components/app-page-card'
import type { Item } from '../types/item.types'
import { sadAscii } from '../utils/strings.utils'
import { maxNameLength, search } from './page-search.const'

export function PageSearch ({ input = '' }: Readonly<{ [key: string]: unknown; input?: string }>) {
  const [header, setHeader] = useState('Loading...')
  const [results, setResults] = useState<Item[]>([])

  useEffect(() => {
    void search(input).then((data) => {
      setHeader(data.header)
      setResults(data.results)
      if (data.results.length === 1) route(`/item/details/${data.results[0]?.$id ?? ''}/single`)
    })
  }, [input])

  return (
    <AppPageCard cardTitle="Search" icon={SearchIcon} pageCode="search" pageTitle={`Search for “${ellipsis(input, maxNameLength)}”`}>
      <div class="flex max-h-[90%] flex-col items-center gap-3 sm:gap-5 md:max-h-full">
        <h2 class="text-center">{header}</h2>
        {results.length > 0 && <>
          <div class="absolute right-7 top-7"><AppDisplayToggle /></div>
          <AppItemList items={results} />
        </>}
        {results.length === 0 && <>
          <p>{sadAscii()}</p>
          <AppButtonNext label='Add a product' url={`/item/add/${input}`} />
        </>}
      </div>
    </AppPageCard>
  )
}
