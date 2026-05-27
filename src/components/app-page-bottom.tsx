import { useMemo } from 'react'
import type { MuiIcon } from '../types/icons.types'
import { AppButtonBack } from './app-button-back'
import { AppButtonNext } from './app-button-next'

export function AppPageBottom({ icon: Icon, nextLabel = 'Home', nextUrl = '/', stepsBack = 1 }: Readonly<{ icon: MuiIcon; nextLabel?: string; nextUrl?: string; stepsBack?: number }>) {
  const style = useMemo(() => ({ fill: 'currentColor', fontSize: 40 }), [])
  return (
    <div className="mx-auto flex items-center">
      <AppButtonBack stepsBack={stepsBack} />
      <Icon className="text-purple-600/40" sx={style} />
      <AppButtonNext label={nextLabel} url={nextUrl} />
    </div>
  )
}
