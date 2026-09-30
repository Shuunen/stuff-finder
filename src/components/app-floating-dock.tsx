import MicIcon from '@mui/icons-material/Mic'
import SearchIcon from '@mui/icons-material/Search'
import { navigateToSearch } from '../pages/page-search.const'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'
import { AppButton } from './app-button'
import { AppPill } from './app-pill'

function onSearch(event: React.KeyboardEvent<HTMLInputElement>) {
  const { key, target } = event
  if (key !== 'Enter') return
  const { value } = target as HTMLInputElement
  if (value === '') return
  logger.debug('onSearch', { value })
  state.sound = 'start'
  navigateToSearch(value)
}

type DockProps = { isUsable: boolean; onSpeech: () => void; placeholder: string; searchRef: React.RefObject<HTMLInputElement | null> }

export function AppFloatingDock({ isUsable, onSpeech, placeholder, searchRef }: DockProps) {
  return (
    <AppPill className="flex w-full max-w-96 items-center justify-between bg-white" name="quick-search">
      <div className="flex grow items-center gap-3">
        <SearchIcon />
        <input className="mt-0.5 grow bg-transparent font-display text-grey outline-none" disabled={!isUsable} onKeyUp={onSearch} placeholder={placeholder} ref={searchRef} />
      </div>
      <AppButton className="flex! h-8 min-w-8! grow-0 overflow-hidden rounded-full! pr-0! pl-3!" name="speak-search" onClick={onSpeech} startIcon={<MicIcon fontSize="small" />} variant="text" />
    </AppPill>
  )
}
