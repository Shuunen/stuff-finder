import SettingsIcon from '@mui/icons-material/Settings'
import { useState } from 'react'
import { AppButton } from '../components/app-button'
import { AppPill } from '../components/app-pill'
import { AppQuickSearch } from '../components/app-quick-search'
import { AppTape } from '../components/app-tape'
import { setPageTitle } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'
import { navigate } from '../utils/navigation.utils'
import { state, watchState } from '../utils/state.utils'

export function PageHome({ ...properties }: Readonly<Record<string, unknown>>) {
  logger.debug('PageHome', { properties })
  setPageTitle('Home')

  const [itemCount, setItemCount] = useState(state.items.length)

  watchState('items', () => {
    setItemCount(state.items.length)
  })

  return (
    <div className="relative flex w-full grow flex-col py-12" data-testid="home">
      <div className="flex items-center justify-between" data-testid="home-header">
        <AppPill name="item-count" className="bg-pastel-1">
          {itemCount} things
        </AppPill>
        <AppButton name="settings" onClick={() => navigate('/settings')} label="Settings" endIcon={<SettingsIcon />} />
      </div>
      <div className="mx-auto flex flex-1 flex-col justify-center" data-testid="home-content">
        <div className="relative inline-block">
          <span className="font-display text-[clamp(44px,12vw,62px)] leading-none font-extrabold">Stuff Finder</span>
          <span className="ml-1 inline-block h-3 w-3 rounded-full border-2 bg-primary align-baseline" />
          <AppTape className="absolute -top-8 left-24 -rotate-4" />
          <p className="my-4 text-grey">Where the heck did I put my label maker?</p>
        </div>
        <AppQuickSearch />
      </div>
    </div>
  )
}
