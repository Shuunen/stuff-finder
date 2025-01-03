import ThemeProvider from '@mui/material/styles/ThemeProvider'
import type { VNode } from 'preact'
import type { MuiIcon } from '../types/icons.types'
import { setPageTitle } from '../utils/browser.utils'
import { theme } from '../utils/theme.utils'
import { AppButtonBack } from './app-button-back'
import { AppPageBottom } from './app-page-bottom'

// eslint-disable-next-line @typescript-eslint/naming-convention
export function AppPageCard ({ cardTitle, children, icon: Icon, nextLabel = 'Home', nextUrl = '/', pageCode, pageTitle, stepsBack = 1 }: Readonly<{ cardTitle: string; children: VNode; icon: MuiIcon; nextLabel?: string; nextUrl?: string; pageCode: string; pageTitle: string; stepsBack?: number }>) {
  setPageTitle(pageTitle)
  return (
    <ThemeProvider theme={theme}>
      <div class="flex max-h-full w-full flex-col items-center print:hidden grow md:grow-0" data-component="page-card" data-page={pageCode}>
        <h3 class="hidden sm:block">{cardTitle}</h3>
        <div class="relative z-10 flex w-full md:w-auto grow flex-col md:min-w-[30rem] justify-center gap-3 overflow-auto bg-gradient-to-b from-white/80 to-white p-4 sm:p-6 md:grow-0 md:gap-6 md:rounded-md md:shadow-md">
          <div class="flex w-full mb-2 sm:mb-4 md:hidden">
            <AppButtonBack />
          </div>
          {children}
        </div>
        <div class="hidden md:block mb-8">
          <AppPageBottom icon={Icon} nextLabel={nextLabel} nextUrl={nextUrl} stepsBack={stepsBack} />
        </div>
      </div>
    </ThemeProvider>
  )
}
