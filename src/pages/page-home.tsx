import { Button } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { type CSSProperties, useCallback, useMemo, useState } from 'react'
import { AppPrompter } from '../components/app-prompter'
import { AppQuickSearch } from '../components/app-quick-search'
import { setPageTitle } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'
import { navigate } from '../utils/navigation.utils'
import { listenUserSpeech } from '../utils/speech.utils'
import { state, watchState } from '../utils/state.utils'
import { theme } from '../utils/theme.utils'
import { navigateToSearch } from './page-search.const'

const triggerColumnClasses = 'flex w-full flex-col gap-3 text-gray-400 transition-colors hover:text-purple-600 duration-400 disabled:opacity-50 disabled:pointer-events-none'

// oxlint-disable-next-line max-lines-per-function
export function PageHome({ ...properties }: Readonly<Record<string, unknown>>) {
  logger.debug('PageHome', { properties })
  setPageTitle('Home')

  const [isUsable, setIsUsable] = useState(state.status !== 'settings-required')
  const ctaStyle = useMemo(() => (isUsable ? {} : ({ filter: 'grayscale(1)', opacity: 0.5, pointerEvents: 'none' } satisfies CSSProperties)), [isUsable])

  watchState('status', () => {
    setIsUsable(state.status !== 'settings-required')
  })

  const onSpeech = useCallback(() => {
    state.status = 'listening'
    listenUserSpeech((transcript: string) => {
      logger.showInfo(`searching for "${transcript}"`)
      navigateToSearch(transcript)
    })
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <div data-page="home">
        {/* new good code */}
        <AppPrompter />
        <div className="grid gap-8 md:grid-cols-3 md:gap-6" style={ctaStyle}>
          <div className={triggerColumnClasses}>
            <Button name="scan" onClick={() => navigate('/scan')} variant="contained" style={{ height: 41, marginTop: 2 }}>
              Scan it
            </Button>
            <svg className="h-8" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <title>Scan icon</title>
              <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2">
                <path d="M2 10V6h4M30 10V6h-4M2 22v4h4M30 22v4h-4M6 9v6M11 9v6M26 9v6M21 9v6M16 9v6M2 18h28M6 21v2M11 21v1M26 21v2M21 21v1M16 21v1" />
              </g>
            </svg>
          </div>
          <div className={triggerColumnClasses}>
            <AppQuickSearch mode="static" placeholder="Type it" />
            <svg className="h-8" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
              <title>Keyboard icon</title>
              <path d="M108 48H68c12-13-12-27 0-40h-8c-12 13 12 27 0 40H20c-9 0-16 7-16 16v40c0 9 7 16 16 16h88c9 0 16-7 16-16V64c0-9-7-16-16-16zm8 56c0 4-4 8-8 8H20c-4 0-8-4-8-8V64c0-4 4-8 8-8h88c4 0 8 4 8 8v40z" fill="currentColor" />
            </svg>
          </div>
          <div className={triggerColumnClasses}>
            <Button name="speech" onClick={onSpeech} variant="contained" style={{ height: 41, marginTop: 2 }}>
              Say it
            </Button>
            <svg className="h-8" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
              <title>Mic icon</title>
              <path d="M108 68a4 4 0 10-8 0 36 36 0 01-72 0 4 4 0 10-8 0c0 23 18 42 40 44v8H40a4 4 0 100 8h48a4 4 0 100-8H68v-8c22-2 40-21 40-44z" fill="currentColor" />
              <path d="M64 8c11 0 20 9 20 20v40a20 20 0 01-40 0V28c0-11 9-20 20-20m0-8C49 0 36 13 36 28v40a28 28 0 0056 0V28C92 13 79 0 64 0z" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
