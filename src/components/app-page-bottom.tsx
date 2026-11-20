import { cn } from '../utils/class.utils'
import { AppButtonBack } from './app-button-back'
import { AppButtonNext } from './app-button-next'

export function AppPageBottom({ className, nextLabel = 'Home', nextUrl = '/', stepsBack = 1 }: Readonly<{ className?: string; nextLabel?: string; nextUrl?: string; stepsBack?: number }>) {
  return (
    <div className={cn('mx-auto flex items-center gap-4', className)} data-testid="app-page-bottom">
      <AppButtonBack stepsBack={stepsBack} />
      <AppButtonNext label={nextLabel} url={nextUrl} />
    </div>
  )
}
