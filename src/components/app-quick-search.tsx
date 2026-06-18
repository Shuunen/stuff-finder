import MicIcon from '@mui/icons-material/Mic'
import SearchIcon from '@mui/icons-material/Search'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { off, on } from 'shuutils'
import { navigateToSearch } from '../pages/page-search.const'
import { logger } from '../utils/logger.utils'
import { listenUserSpeech } from '../utils/speech.utils'
import { state, watchState } from '../utils/state.utils'
import { AppButton } from './app-button'
import { AppPill } from './app-pill'

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
    <AppPill className="flex w-full max-w-96 items-center justify-between bg-white" name="quick-search">
      <div className="flex grow items-center gap-3">
        <SearchIcon />
        <input className="mt-0.5 grow bg-transparent font-display text-grey outline-none" disabled={!isUsable} onKeyUp={onSearch} placeholder={placeholder} ref={searchRef} />
      </div>
      <AppButton className="flex! h-8 min-w-8! grow-0 overflow-hidden rounded-full! pr-0! pl-3!" name="speak-search" onClick={onSpeech} startIcon={<MicIcon fontSize="small" />} variant="text" />
    </AppPill>
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

export function AppQuickSearch({ placeholder = 'label maker, AAA batteries…' }: Readonly<{ placeholder?: string }>) {
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

  return renderFloatingDock({ isUsable, onSpeech, placeholder, searchRef: searchReference })
}
