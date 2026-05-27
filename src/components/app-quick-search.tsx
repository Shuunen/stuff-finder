import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { off, on, tw } from 'shuutils'
import { navigateToSearch } from '../pages/page-search.const'
import { logger } from '../utils/logger.utils'
import { state, watchState } from '../utils/state.utils'

function onSearch(event: React.KeyboardEvent<HTMLInputElement>) {
  const { key, target } = event
  if (key !== 'Enter') return
  const { value } = target as HTMLInputElement
  if (value === '') return
  logger.debug('onSearch', { value })
  state.sound = 'start'
  navigateToSearch(value)
}

function hasNativeInput(path: string) {
  return path.startsWith('/item/add') || path === '/item/edit' || path.startsWith('/item/edit/')
}

const focusDelay = 100

const theme = {
  common: tw('h-11 w-full max-w-xs rounded-md border-2 border-purple-500 px-3 text-lg text-purple-900 shadow-md transition-all hover:shadow-lg md:text-base'),
  floating: tw('w-32 pb-1 opacity-60 focus-within:w-56 focus-within:bg-white focus-within:opacity-100 focus-within:outline-purple-500 hover:opacity-100'),
  static: tw('bg-white placeholder:text-center'),
}

export function AppQuickSearch({ mode, placeholder = 'Quick search...' }: Readonly<{ mode: 'floating' | 'static'; placeholder?: string }>) {
  const searchReference = useRef<HTMLInputElement>(null)
  const [isUsable, setIsUsable] = useState(state.status !== 'settings-required')
  const { pathname: path } = useLocation()

  watchState('status', () => {
    setIsUsable(state.status !== 'settings-required')
  })

  useEffect(() => {
    const focusHandler = on('focus', () => {
      const canAutoFocus = path === '/' && isUsable
      if (!canAutoFocus) return
      logger.debug('focus on correct page, will autofocus quick-search', { path })
      setTimeout(() => {
        searchReference.current?.focus()
      }, focusDelay)
    })
    const keypressHandler = on('keypress', (_data, event) => {
      if (!(event instanceof KeyboardEvent)) return
      const canFocus = !hasNativeInput(path) && isUsable
      if (!canFocus) return
      const isInInput = event.target instanceof HTMLElement && event.target.tagName.toLowerCase() === 'input'
      if (isInInput) return
      logger.debug('keypress on correct page & not in search input, will focus quick-search', { path })
      searchReference.current?.focus()
    })
    return () => {
      off(focusHandler)
      off(keypressHandler)
    }
  }, [isUsable, path])

  const classes = tw(`${theme[mode]} ${theme.common}`)

  return <input className={classes} onKeyUp={onSearch} placeholder={placeholder} ref={searchReference} />
}
