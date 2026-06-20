import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { ellipsis } from 'shuutils'
import { AppButtonBack } from '../components/app-button-back'
import { AppButtonNext } from '../components/app-button-next'
import { AppDisplayToggle } from '../components/app-display-toggle'
import { AppItemList } from '../components/app-item-list'
import { AppPill } from '../components/app-pill'
import { AppTape } from '../components/app-tape'
import { setPageTitle } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'
import { sadAscii } from '../utils/strings.utils'
import { maxNameLength, search, type SearchState } from './page-search.const'

const emptyResults: SearchState['results'] = []

// oxlint-disable-next-line max-lines-per-function
export function PageSearch() {
  const { input = '' } = useParams<{ input: string }>()
  const { state } = useLocation() as { state: SearchState | null }
  const stateResults = useMemo(() => state?.results ?? emptyResults, [state])
  const [lastSearchedInput, setLastSearchedInput] = useState(() => (stateResults.length > 0 ? input : ''))
  const [asyncResults, setAsyncResults] = useState<SearchState['results']>(() => (stateResults.length > 0 ? stateResults : []))
  const results = stateResults.length > 0 ? stateResults : asyncResults
  const loading = stateResults.length === 0 && lastSearchedInput !== input
  setPageTitle(`Search for "${ellipsis(input, maxNameLength)}"`)

  useEffect(() => {
    if (stateResults.length > 0) return
    // oxlint-disable-next-line prefer-await-to-then, always-return
    void search(input).then(data => {
      logger.info('search results loaded', { header: data.header, input, results: data.results, state })
      setAsyncResults(data.results)
      setLastSearchedInput(input)
    })
  }, [input, stateResults, state])

  return (
    <div className="flex h-full grow animate-fade-up flex-col" data-page="search">
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <AppButtonBack />
        <AppPill name="search-results" className="ml-6 bg-pastel-1">
          {loading ? '…' : `${results.length} results found`}
        </AppPill>
        <AppDisplayToggle />
      </div>

      <div className="relative my-2 flex items-center justify-center">
        <h1 className="relative z-20 my-4 -rotate-2 text-center text-2xl md:text-3xl">Looking for &ldquo;{ellipsis(input, maxNameLength)}&rdquo;</h1>
        <AppTape className="absolute top-4 z-0 w-96 -rotate-2 bg-white" />
      </div>

      {loading && (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      )}

      {!loading && results.length > 0 && <AppItemList items={results} />}

      {!loading && results.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 pb-24">
          <code className="animate-bounce text-4xl text-primary">{sadAscii()}</code>
          <p className="text-center text-grey">Nothing found for &ldquo;{input}&rdquo;</p>
          <AppButtonNext label="Add this thing" url={`/item/add/${input}`} />
        </div>
      )}
    </div>
  )
}
