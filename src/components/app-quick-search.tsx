import { signal, useSignalEffect } from '@preact/signals'
import { route, useRouter } from 'preact-router'
import { useCallback, useRef, useState } from 'preact/hooks'
import { off, on, tw } from 'shuutils'
import { logger } from '../utils/logger.utils'
import { state, watchState } from '../utils/state.utils'

function onSearch (event: KeyboardEvent) {
  const { key, target } = event
  if (key !== 'Enter') return
  const { value } = target as HTMLInputElement // eslint-disable-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion
  if (value === '') return
  logger.debug('onSearch', { value })
  state.sound = 'start'
  route(`/search/${value}`)
}

const pagesWithInputs = new Set(['/item/add', '/item/edit/:id'])

const focusDelay = 100

export function AppQuickSearch ({ mode, placeholder = 'Quick search...' }: Readonly<{ mode: 'floating' | 'static'; placeholder?: string, }>) {
  const searchReference = useRef<HTMLInputElement>(null)
  const search = signal(searchReference)
  const [isUsable, setIsUsable] = useState(state.status !== 'settings-required')
  const [{ path }] = useRouter()

  watchState('status', () => { setIsUsable(state.status !== 'settings-required') })

  useSignalEffect(useCallback(() => {
    const focusHandler = on('focus', () => {
      const canAutoFocus = path === '/' && isUsable
      if (!canAutoFocus) return
      logger.debug('focus on correct page, will autofocus quick-search', { path })
      setTimeout(() => { search.value.current?.focus() }, focusDelay)
    })
    const keypressHandler = on('keypress', (event: KeyboardEvent) => {
      const canFocus = !pagesWithInputs.has(path ?? '') && isUsable
      if (!canFocus) return
      const isInSearchInput = event.target instanceof HTMLElement && event.target.className === search.value.current?.className
      if (isInSearchInput) return
      logger.debug('keypress on correct page & not in search input, will focus quick-search', { path })
      search.value.current?.focus()
    })
    return () => {
      off(focusHandler)
      off(keypressHandler)
    }
  }, [search.value, isUsable, path]))

  const theme = {
    common: tw('h-11 w-full max-w-xs rounded-md border-2 border-purple-500 px-3  text-lg text-purple-900 shadow-md transition-all hover:shadow-lg md:text-base'),
    floating: tw('w-32 pb-1 opacity-60 focus-within:w-56 focus-within:bg-white focus-within:opacity-100  focus-within:outline-purple-500 hover:opacity-100'),
    static: tw('placeholder:text-center'),
  }

  const classes = tw(`${theme[mode]} ${theme.common}`)

  return (
    <input class={classes} onKeyPress={onSearch} placeholder={placeholder} ref={searchReference} />
  )
}
