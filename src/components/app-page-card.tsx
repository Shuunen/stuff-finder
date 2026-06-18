import { ThemeProvider } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { setPageTitle } from '../utils/browser.utils'
import { theme } from '../utils/theme.utils'
import { AppButtonBack } from './app-button-back'
import { AppPageBottom } from './app-page-bottom'

type AppPageCardProps = Readonly<{
  cardTitle: string
  children: ReactNode
  nextLabel?: string
  nextUrl?: string
  pageCode: string
  pageTitle: string
  stepsBack?: number
}>

export function AppPageCard({ cardTitle, children, nextLabel = 'Home', nextUrl = '/', pageCode, pageTitle, stepsBack = 1 }: AppPageCardProps) {
  setPageTitle(pageTitle)
  return (
    <ThemeProvider theme={theme}>
      <div className="flex max-h-full w-full grow animate-fade-up flex-col items-center justify-between print:hidden" data-component="page-card" data-page={pageCode}>
        <h3 className="mt-auto mb-6 hidden sm:block">{cardTitle}</h3>
        <div className="relative z-10 block w-full overflow-auto bg-linear-to-b from-white/60 to-white p-4 sm:p-6 md:w-auto md:min-w-120 md:gap-6 md:rounded-md md:shadow-md">
          <div className="mb-2 flex w-full sm:mb-4 md:hidden">
            <AppButtonBack />
          </div>
          {children}
        </div>
        <div className="my-8 mb-auto hidden md:block">
          <AppPageBottom nextLabel={nextLabel} nextUrl={nextUrl} stepsBack={stepsBack} />
        </div>
      </div>
    </ThemeProvider>
  )
}
