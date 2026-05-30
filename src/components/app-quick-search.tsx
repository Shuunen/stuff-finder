import HomeIcon from '@mui/icons-material/Home'
import MicIcon from '@mui/icons-material/Mic'
import SearchIcon from '@mui/icons-material/Search'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { off, on } from 'shuutils'
import { navigateToSearch } from '../pages/page-search.const'
import { logger } from '../utils/logger.utils'
import { navigate } from '../utils/navigation.utils'
import { listenUserSpeech } from '../utils/speech.utils'
import { state, watchState } from '../utils/state.utils'

const focusDelay = 100

function hasNativeInput(path: string) {
  return path.startsWith('/item/add') || path === '/item/edit' || path.startsWith('/item/edit/')
}

function onSearch(event: React.KeyboardEvent<HTMLInputElement>) {
  const { key, target } = event
  if (key !== 'Enter') return
  const { value } = target as HTMLInputElement
  if (value === '') return
  logger.debug('onSearch', { value })
  state.sound = 'start'
  navigateToSearch(value)
}

type DockProps = { isUsable: boolean; onSpeech: () => void; placeholder: string; searchRef: React.RefObject<HTMLInputElement | null> }

function renderFloatingDock({ isUsable, onSpeech, placeholder, searchRef }: DockProps) {
  return (
    <div className="search-dock bg-white">
      <div className="flex items-center gap-3">
        <SearchIcon />
        <input className="bg-transparent font-display text-grey outline-none" disabled={!isUsable} onKeyUp={onSearch} placeholder={placeholder} ref={searchRef} />
      </div>
      <div className="flex gap-2">
        <button className="search-dock-action bg-pastel-2 text-grey" onClick={onSpeech} title="Speak to search" type="button">
          <MicIcon fontSize="small" />
        </button>
        <button className="search-dock-action bg-pastel-3 text-grey" onClick={() => navigate('/')} title="Home" type="button">
          <HomeIcon fontSize="small" />
        </button>
      </div>
    </div>
  )
}

function setupListeners(path: string, isUsable: boolean, searchRef: React.RefObject<HTMLInputElement | null>) {
  const focusHandler = on('focus', () => {
    if (path !== '/' || !isUsable) return
    setTimeout(() => {
      searchRef.current?.focus()
    }, focusDelay)
  })
  const keypressHandler = on('keypress', (_data, event) => {
    if (!(event instanceof KeyboardEvent) || hasNativeInput(path) || !isUsable) return
    if (event.target instanceof HTMLElement && event.target.tagName.toLowerCase() === 'input') return
    searchRef.current?.focus()
  })
  return () => {
    off(focusHandler)
    off(keypressHandler)
  }
}

export function AppQuickSearch({ mode, placeholder = 'Quick search…' }: Readonly<{ mode: 'floating' | 'static'; placeholder?: string }>) {
  const searchReference = useRef<HTMLInputElement>(null)
  const [isUsable, setIsUsable] = useState(state.status !== 'settings-required')
  const { pathname: path } = useLocation()

  watchState('status', () => {
    setIsUsable(state.status !== 'settings-required')
  })
  useEffect(() => setupListeners(path, isUsable, searchReference), [isUsable, path])

  const onSpeech = () => {
    if (!isUsable) return
    state.status = 'listening'
    listenUserSpeech((transcript: string) => {
      logger.showInfo(`searching for "${transcript}"`)
      navigateToSearch(transcript)
    })
  }

  if (mode === 'floating') return renderFloatingDock({ isUsable, onSpeech, placeholder, searchRef: searchReference })
  return (
    <input
      className="h-11 w-full max-w-xs rounded-xl border-2 bg-white px-3 font-display text-lg font-semibold outline-none"
      disabled={!isUsable}
      onKeyUp={onSearch}
      placeholder={placeholder}
      ref={searchReference}
      style={{ boxShadow: '2px 2px 0 var(--color-black)' }}
    />
  )
}
