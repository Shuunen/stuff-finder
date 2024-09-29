import type { VNode } from 'preact'
import type { MuiIcon } from '../types/icons.types'
import { setPageTitle } from '../utils/browser.utils'
import { AppButtonBack } from './app-button-back'
import { AppPageBottom } from './app-page-bottom'

// eslint-disable-next-line @typescript-eslint/naming-convention
export function AppPageCard ({ cardTitle, children, icon: Icon, nextLabel = 'Home', nextUrl = '/', pageCode, pageTitle, stepsBack = 1 }: Readonly<{ cardTitle: string; children: VNode; icon: MuiIcon; nextLabel?: string; nextUrl?: string; pageCode: string; pageTitle: string; stepsBack?: number }>) {
  setPageTitle(pageTitle)
  return (
    <div className="flex max-h-full w-full grow flex-col print:hidden" data-component="page-card" data-page={pageCode}>
      <h3 className="hidden sm:block">{cardTitle}</h3>
      <div className="relative z-10 flex w-full max-w-4xl grow flex-col justify-start gap-3 overflow-auto bg-gradient-to-b from-white/80 to-white p-4 sm:p-6 md:w-auto md:grow-0 md:gap-6 md:rounded-md md:p-8 md:shadow-md">
        <div className="flex w-full justify-start sm:mb-4 md:hidden">
          <AppButtonBack />
        </div>
        {children}
      </div>
      <div className="hidden md:block">
        <AppPageBottom icon={Icon} nextLabel={nextLabel} nextUrl={nextUrl} stepsBack={stepsBack} />
      </div>
    </div>
  )
}
