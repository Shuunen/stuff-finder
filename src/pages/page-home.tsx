import AddIcon from '@mui/icons-material/Add'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import MicIcon from '@mui/icons-material/Mic'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import SearchIcon from '@mui/icons-material/Search'
import SettingsIcon from '@mui/icons-material/Settings'
import { useCallback, useState } from 'react'
import { AppPill } from '../components/app-pill'
import { setPageTitle } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'
import { navigate } from '../utils/navigation.utils'
import { listenUserSpeech } from '../utils/speech.utils'
import { state, watchState } from '../utils/state.utils'
import { navigateToSearch } from './page-search.const'

// oxlint-disable-next-line max-lines-per-function
export function PageHome({ ...properties }: Readonly<Record<string, unknown>>) {
  logger.debug('PageHome', { properties })
  setPageTitle('Home')

  const [query, setQuery] = useState('')
  const [isUsable, setIsUsable] = useState(state.status !== 'settings-required')
  const itemCount = state.items.length

  watchState('status', () => {
    setIsUsable(state.status !== 'settings-required')
  })

  const onSearch = useCallback(
    (event: { preventDefault(): void }) => {
      event.preventDefault()
      if (!query.trim() || !isUsable) return
      state.sound = 'start'
      navigateToSearch(query.trim())
    },
    [query, isUsable],
  )

  const onSpeech = useCallback(() => {
    if (!isUsable) return
    state.status = 'listening'
    listenUserSpeech((transcript: string) => {
      logger.showInfo(`searching for "${transcript}"`)
      navigateToSearch(transcript)
    })
  }, [isUsable])

  return (
    <div className="sf-page relative w-full py-12" data-testid="home">
      <div className="flex items-center justify-between" data-testid="home-header">
        <AppPill className="bg-pastel-1">{itemCount} things</AppPill>
        <button className="sf-icon-btn" onClick={() => navigate('/settings')} title="Settings" type="button">
          <SettingsIcon />
        </button>
      </div>
      <div className="mx-auto flex flex-1 flex-col justify-center" data-testid="home-content">
        <div className="relative mb-7">
          <div className="relative inline-block">
            <span className="font-display text-[clamp(44px,12vw,62px)] leading-none font-extrabold">Stuff Finder</span>
            <span className="mb-1 ml-1 inline-block h-3 w-3 rounded-full border-2 bg-pastel-5 align-baseline" />
            <div className="sf-tape absolute" style={{ right: -18, top: -8, transform: 'rotate(-4deg)', width: 70 }} />
          </div>
          <p className="mt-4 leading-relaxed text-grey">Where the heck did I put my label maker?</p>
        </div>
        <form onSubmit={onSearch}>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="sf-search-input md:min-w-md">
              <SearchIcon />
              <input
                className="grow outline-none"
                onChange={event => {
                  setQuery(event.target.value)
                }}
                placeholder="label maker, AAA batteries…"
                value={query}
              />
            </div>
            <button className="sf-find-btn md:max-w-fit md:px-8" type="submit">
              Find it
              <ArrowForwardIcon />
            </button>
          </div>
        </form>
      </div>
      <div className="flex items-center justify-center gap-7">
        <button className="sf-ghost-btn" onClick={() => navigate('/scan')} type="button">
          <QrCodeScannerIcon />
          Scan
        </button>
        <span className="h-4 w-px" style={{ background: 'color-mix(in srgb, var(--color-grey) 40%, transparent)' }} />
        <button className="sf-ghost-btn" onClick={onSpeech} type="button">
          <MicIcon /> Speak
        </button>
        <span className="h-4 w-px" style={{ background: 'color-mix(in srgb, var(--color-grey) 40%, transparent)' }} />
        <button className="sf-ghost-btn" onClick={() => navigate('/item/add')} type="button">
          Add <AddIcon />
        </button>
      </div>
    </div>
  )
}
