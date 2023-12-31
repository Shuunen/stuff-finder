import type DefaultIcon from '@mui/icons-material/EmojiEmotions'
import Button from '@mui/material/Button'
import { route } from 'preact-router'
import { AppButtonBack } from './app-button-back'

// eslint-disable-next-line @typescript-eslint/naming-convention
export function AppPageBottom ({ icon: Icon, nextLabel = 'Home', nextType = 'button', nextUrl = '/', stepsBack = 1 }: { readonly icon: typeof DefaultIcon; readonly nextLabel?: string; readonly nextType?: 'button' | 'submit'; readonly nextUrl?: string; readonly stepsBack?: number }) {
  return (
    <div className="mx-auto flex">
      <AppButtonBack stepsBack={stepsBack} />
      {/* eslint-disable-next-line react/forbid-component-props */}
      <Icon className="text-purple-600/40" sx={{ fontSize: 60 }} />
      <Button onClick={() => route(nextUrl)} type={nextType} variant="contained">{nextLabel}</Button>
    </div>
  )
}
