import type { MuiIcon } from '../types/icons.types'
import { AppButtonBack } from './app-button-back'
import { AppButtonNext } from './app-button-next'

// eslint-disable-next-line @typescript-eslint/naming-convention
export function AppPageBottom ({ icon: Icon, nextLabel = 'Home', nextUrl = '/', stepsBack = 1 }: { readonly icon: MuiIcon; readonly nextLabel?: string; readonly nextUrl?: string; readonly stepsBack?: number }) {
  return (
    <div className="mx-auto flex">
      <AppButtonBack stepsBack={stepsBack} />
      {/* eslint-disable-next-line react/forbid-component-props */}
      <Icon className="text-purple-600/40" sx={{ fontSize: 60 }} />
      <AppButtonNext label={nextLabel} url={nextUrl} />
    </div>
  )
}
