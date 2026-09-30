import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { off, on } from 'shuutils'
import { navigateToSearch } from '../pages/page-search.const'
import { logger } from '../utils/logger.utils'
import { listenUserSpeech } from '../utils/speech.utils'
import { state, watchState } from '../utils/state.utils'
import { AppFloatingDock } from './app-floating-dock'

const focusDelay = 100

function hasNativeInput(path: string) {
  return path.startsWith('/item/add') || path === '/item/edit' || path.startsWith('/item/edit/')
}

function startSpeechSearch() {
  state.status = 'listening'
  listenUserSpeech((transcript: string) => {
    logger.showInfo(`searching for "${transcript}"`)
    navigateToSearch(transcript)
  })
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
    startSpeechSearch()
  }

  return <AppFloatingDock isUsable={isUsable} onSpeech={onSpeech} placeholder={placeholder} searchRef={searchReference} />
}
