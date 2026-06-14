import AddIcon from '@mui/icons-material/Add'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import MicIcon from '@mui/icons-material/Mic'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import SearchIcon from '@mui/icons-material/Search'
import SettingsIcon from '@mui/icons-material/Settings'
import { useCallback, useState } from 'react'
import { AppButton } from '../components/app-button'
import { AppPill } from '../components/app-pill'
import { AppTape } from '../components/app-tape'
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
  const [itemCount, setItemCount] = useState(state.items.length)

  watchState('status', () => {
    setIsUsable(state.status !== 'settings-required')
  })
  watchState('items', () => {
    setItemCount(state.items.length)
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
    <div className="relative flex w-full grow flex-col py-12" data-testid="home">
      <div className="flex items-center justify-between" data-testid="home-header">
        <AppPill name="item-count" className="bg-pastel-1">
          {itemCount} things
        </AppPill>
        <AppButton name="settings" onClick={() => navigate('/settings')} label="Settings" endIcon={<SettingsIcon />} />
      </div>
      <div className="mx-auto flex flex-1 flex-col justify-center" data-testid="home-content">
        <div className="relative mb-7">
          <div className="relative inline-block">
            <span className="font-display text-[clamp(44px,12vw,62px)] leading-none font-extrabold">Stuff Finder</span>
            <span className="mb-1 ml-1 inline-block h-3 w-3 rounded-full border-2 bg-pastel-5 align-baseline" />
            <AppTape className="absolute -top-8 left-24 -rotate-4" />
          </div>
          <p className="mt-4 leading-relaxed text-grey">Where the heck did I put my label maker?</p>
        </div>
        <form onSubmit={onSearch}>
          <div className="flex flex-col gap-4 md:flex-row">
            <AppPill name="home-search-input" className="rounded-xl bg-white px-4 py-3 md:min-w-md">
              <SearchIcon />
              <input
                className="ml-2 grow outline-none"
                onChange={event => {
                  setQuery(event.target.value)
                }}
                placeholder="label maker, AAA batteries…"
                value={query}
              />
            </AppPill>
            <AppButton name="find" label="Find it" type="submit" color="primary" disabled={!isUsable} endIcon={<ArrowForwardIcon />} />
          </div>
        </form>
      </div>
      <div className="flex items-center justify-center gap-7">
        <AppButton label="Scan" name="scan" onClick={() => navigate('/scan')} variant="text" disabled={!isUsable} startIcon={<QrCodeScannerIcon />} />
        <span className="h-4 w-px" style={{ background: 'color-mix(in srgb, var(--color-grey) 40%, transparent)' }} />
        <AppButton label="Speak" name="speak" onClick={onSpeech} variant="text" disabled={!isUsable} startIcon={<MicIcon />} />
        <span className="h-4 w-px" style={{ background: 'color-mix(in srgb, var(--color-grey) 40%, transparent)' }} />
        <AppButton label="Add" name="add" onClick={() => navigate('/item/add')} variant="text" disabled={!isUsable} startIcon={<AddIcon />} />
      </div>
    </div>
  )
}
