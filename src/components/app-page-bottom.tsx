import { AppButtonBack } from './app-button-back'
import { AppButtonNext } from './app-button-next'

export function AppPageBottom({ nextLabel = 'Home', nextUrl = '/', stepsBack = 1 }: Readonly<{ nextLabel?: string; nextUrl?: string; stepsBack?: number }>) {
  return (
    <div className="mx-auto flex items-center gap-4" data-testid="app-page-bottom">
      <AppButtonBack stepsBack={stepsBack} />
      <AppButtonNext label={nextLabel} url={nextUrl} />
    </div>
  )
}
