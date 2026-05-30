import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { ellipsis } from 'shuutils'
import { AppButtonBack } from '../components/app-button-back'
import { AppButtonNext } from '../components/app-button-next'
import { AppDisplayToggle } from '../components/app-display-toggle'
import { AppItemList } from '../components/app-item-list'
import { AppPill } from '../components/app-pill'
import { AppQuickSearch } from '../components/app-quick-search'
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
  const [results, setResults] = useState(stateResults)
  const [header, setHeader] = useState(state?.header ?? '')
  const [loading, setLoading] = useState(stateResults.length === 0)
  setPageTitle(`Search for "${ellipsis(input, maxNameLength)}"`)

  useEffect(() => {
    if (stateResults.length > 0) {
      setHeader(state?.header ?? '')
      setResults(stateResults)
      setLoading(false)
      return
    }
    setLoading(true)
    // oxlint-disable-next-line prefer-await-to-then, always-return
    void search(input).then(data => {
      logger.info('search results loaded', { header: data.header, input, results: data.results, state })
      setHeader(data.header)
      setResults(data.results)
      setLoading(false)
    })
  }, [input, stateResults, state])

  return (
    <div className="sf-page" data-page="search">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <AppButtonBack />
        <AppPill className="bg-pastel-1">{loading ? '…' : `${results.length} found`}</AppPill>
        <AppDisplayToggle />
      </div>

      {/* Query headline */}
      <div className="px-5 pt-2 pb-4">
        <div className="font-display text-2xl leading-tight font-bold">Looking for</div>
        <div className="mt-1 inline-flex">
          <span
            className="border-2 px-2 py-0.5 text-2xl font-bold"
            style={{
              background: 'var(--color-pastel-1)',
              borderColor: 'var(--color-black)',
              borderRadius: 8,
              boxShadow: '2px 2px 0 var(--color-black)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {ellipsis(input, maxNameLength)}
          </span>
        </div>
        {header.length > 0 && <p className="mt-1 font-mono text-sm text-grey">{header}</p>}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && <AppItemList items={results} />}

      {/* Empty state */}
      {!loading && results.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 pb-24">
          <code className="animate-bounce text-4xl text-primary">{sadAscii()}</code>
          <p className="text-center text-grey">Nothing found for &ldquo;{input}&rdquo;</p>
          <AppButtonNext label="Add this thing" url={`/item/add/${input}`} />
        </div>
      )}

      {/* Bottom search dock */}
      <AppQuickSearch mode="floating" />
    </div>
  )
}
