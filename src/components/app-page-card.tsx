import type { VNode } from 'preact'
import type { MuiIcon } from '../types/icons.types'
import { setPageTitle } from '../utils/browser.utils'
import { AppButtonBack } from './app-button-back'
import { AppPageBottom } from './app-page-bottom'

// eslint-disable-next-line @typescript-eslint/naming-convention
export function AppPageCard ({ cardTitle, children, icon: Icon, nextLabel = 'Home', nextUrl = '/', pageCode, pageTitle, stepsBack = 1 }: { readonly cardTitle: string; readonly children: VNode; readonly icon: MuiIcon; readonly nextLabel?: string; readonly nextUrl?: string; readonly pageCode: string; readonly pageTitle: string; readonly stepsBack?: number }) {
  setPageTitle(pageTitle)
  return (
    <div className="flex max-h-full w-full grow flex-col print:hidden" data-component="page-card" data-page={pageCode}>
      <h3>{cardTitle}</h3>
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl grow flex-col justify-start gap-3 bg-gradient-to-b from-white/80 to-white p-8 md:w-auto md:grow-0 md:flex-row md:gap-6 md:rounded-md md:p-8 md:shadow-md">
        <div className="mb-4 flex w-full justify-start md:hidden">
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
