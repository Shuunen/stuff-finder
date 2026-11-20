import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppBoxDrawers } from '../components/app-box-drawers'
import { AppButton } from '../components/app-button'
import { AppButtonBack } from '../components/app-button-back'
import { AppDisplayToggle } from '../components/app-display-toggle'
import { AppPageTitle } from '../components/app-page-title'
import { AppPill } from '../components/app-pill'
import { boxToTitle, groupItemsByDrawer } from '../utils/box.utils'
import { setPageTitle } from '../utils/browser.utils'
import { navigate } from '../utils/navigation.utils'
import { state, watchState } from '../utils/state.utils'
import { sadAscii } from '../utils/strings.utils'
import { unknownBoxName } from './page-metrics.utils'

export function PageBox() {
  const { box: boxParameter = '', drawer: drawerParameter } = useParams<{ box: string; drawer?: string }>()
  const box = boxParameter === unknownBoxName ? '' : boxParameter
  const [items, setItems] = useState(state.items)
  watchState('items', () => {
    setItems(state.items)
  })
  const boxItems = useMemo(() => items.filter(item => item.box === box && (drawerParameter === undefined || item.drawer === Number(drawerParameter))), [items, box, drawerParameter])
  const drawerGroups = useMemo(() => groupItemsByDrawer(boxItems), [boxItems])
  setPageTitle(`Box ${boxToTitle(boxParameter)}`)

  return (
    <div className="flex h-full grow animate-fade-up flex-col" data-page="box" data-testid="page-box">
      <div className="flex items-center justify-between px-5 pt-4 pb-2" data-testid="box-header">
        <AppButtonBack />
        <AppPill name="box-items" className="ml-6 bg-pastel-1">
          {boxItems.length} {boxItems.length === 1 ? 'item' : 'items'}
        </AppPill>
        <AppDisplayToggle />
      </div>

      <AppPageTitle name="box">{boxParameter === unknownBoxName ? 'No box specified' : boxToTitle(boxParameter)}</AppPageTitle>

      {drawerParameter !== undefined && (
        <div className="flex justify-center px-5">
          <AppButton color="pastel-3" label="Show other drawers" name="show-other-drawers" onClick={() => navigate(`/box/${encodeURIComponent(boxParameter)}`)} />
        </div>
      )}

      <AppBoxDrawers groups={drawerGroups} />

      {boxItems.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 pb-24" data-testid="box-empty">
          <code className="animate-bounce text-4xl text-primary">{sadAscii()}</code>
          <p className="text-center text-grey">Nothing in this box</p>
        </div>
      )}
    </div>
  )
}
