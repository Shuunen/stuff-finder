import { signal, useSignalEffect } from '@preact/signals'
import { route, useRouter } from 'preact-router'
import { useCallback, useRef, useState } from 'preact/hooks'
import { off, on } from 'shuutils'
import { delays } from '../constants'
import { logger } from '../utils/logger.utils'
import { state, watchState } from '../utils/state.utils'

function onSearch (event: KeyboardEvent) {
  const { key, target } = event
  if (key !== 'Enter') return
  const { value } = target as HTMLInputElement // eslint-disable-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion
  if (value === '') return
  logger.debug('onSearch', { value })
  route(`/search/${value}`)
}

const pagesWithInputs = new Set(['/item/add', '/item/edit/:id'])

export function AppQuickSearch ({ placeholder = 'Quick search...' }: Readonly<{ placeholder?: string }>) {
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
      setTimeout(() => { search.value.current?.focus() }, delays.small)
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

  return (
    <input class="h-11 w-full max-w-xs rounded-md border-2 border-purple-500 px-2 text-lg text-purple-900 shadow-md placeholder:text-center hover:shadow-lg md:text-base" onKeyPress={onSearch} placeholder={placeholder} ref={searchReference} />
  )
}
