import SearchIcon from '@mui/icons-material/Search'
import { CircularProgress } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { ellipsis } from 'shuutils'
import { AppButtonNext } from '../components/app-button-next'
import { AppDisplayToggle } from '../components/app-display-toggle'
import { AppItemList } from '../components/app-item-list'
import { AppPageCard } from '../components/app-page-card'
import { logger } from '../utils/logger.utils'
import { sadAscii } from '../utils/strings.utils'
import { maxNameLength, search, type SearchState } from './page-search.const'

const emptyResults: SearchState['results'] = []

export function PageSearch() {
  const { input = '' } = useParams<{ input: string }>()
  const { state } = useLocation() as { state: SearchState | null }
  const stateResults = useMemo(() => state?.results ?? emptyResults, [state])
  const [results, setResults] = useState(stateResults)
  const [loading, setLoading] = useState(stateResults.length === 0)

  useEffect(() => {
    if (stateResults.length > 0) {
      setResults(stateResults)
      setLoading(false)
      return
    }
    setLoading(true)
    // oxlint-disable-next-line prefer-await-to-then, always-return
    void search(input).then(data => {
      logger.info('search results loaded', { header: data.header, input, results: data.results, state })
      setResults(data.results)
      setLoading(false)
    })
  }, [input, stateResults, state])

  return (
    <AppPageCard cardTitle="Search" icon={SearchIcon} pageCode="search" pageTitle={`Search for “${ellipsis(input, maxNameLength)}”`}>
      <div className="flex max-h-[90%] flex-col items-center gap-3 sm:gap-5 md:max-h-full">
        <h2 className="text-center">{state?.header}</h2>
        {loading && <CircularProgress className="size-12 text-primary" />}
        {results.length > 0 && (
          <>
            <div className="absolute top-7 right-7">
              <AppDisplayToggle />
            </div>
            <AppItemList items={results} />
          </>
        )}
        {!loading && results.length === 0 && (
          <>
            <code className="my-4 animate-bounce text-4xl text-primary">{sadAscii()}</code>
            <AppButtonNext label="Add a product" url={`/item/add/${input}`} />
          </>
        )}
      </div>
    </AppPageCard>
  )
}
