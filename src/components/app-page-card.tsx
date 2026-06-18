import type { ReactNode } from 'react'
import { setPageTitle } from '../utils/browser.utils'
import { AppCard } from './app-card'
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
    <div className="flex w-full grow flex-col items-center justify-center gap-6 print:hidden" data-component="page-card" data-page={pageCode}>
      <h3>{cardTitle}</h3>
      <AppCard name="page-card" className="items-center">
        {children}
      </AppCard>
      <AppPageBottom nextLabel={nextLabel} nextUrl={nextUrl} stepsBack={stepsBack} />
    </div>
  )
}
