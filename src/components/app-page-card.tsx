import type { ReactNode } from 'react'
import { setPageTitle } from '../utils/browser.utils'
import { AppCard } from './app-card'
import { AppPageBottom } from './app-page-bottom'

type AppPageCardProps = Readonly<{
  cardTitle: string
  children: ReactNode
  /** Optional, set to false to show the content straight on the page, with the navigation buttons next to the title */
  hasCard?: boolean
  nextLabel?: string
  nextUrl?: string
  pageCode: string
  pageTitle: string
  stepsBack?: number
}>

export function AppPageCard({ cardTitle, children, hasCard = true, nextLabel = 'Home', nextUrl = '/', pageCode, pageTitle, stepsBack = 1 }: AppPageCardProps) {
  setPageTitle(pageTitle)
  if (!hasCard)
    return (
      <div className="mx-auto flex w-full max-w-7xl grow flex-col gap-6 print:hidden" data-component="page-card" data-page={pageCode} data-testid={`page-${pageCode}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3>{cardTitle}</h3>
          <AppPageBottom className="mx-0" nextLabel={nextLabel} nextUrl={nextUrl} stepsBack={stepsBack} />
        </div>
        {children}
      </div>
    )
  return (
    <div className="flex w-full grow flex-col items-center justify-center gap-6 print:hidden" data-component="page-card" data-page={pageCode} data-testid={`page-${pageCode}`}>
      <h3>{cardTitle}</h3>
      <AppCard name="page-card" className="items-center">
        {children}
      </AppCard>
      <AppPageBottom nextLabel={nextLabel} nextUrl={nextUrl} stepsBack={stepsBack} />
    </div>
  )
}
