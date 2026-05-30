import { useParams } from 'react-router-dom'
import { AppButtonBack } from '../components/app-button-back'
import { AppItemDetails } from '../components/app-item-details'
import { AppQuickSearch } from '../components/app-quick-search'
import { setPageTitle } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

export function PageItemDetails() {
  const { id, context } = useParams<{ id: string; context?: string }>()
  if (typeof id !== 'string') return <>An id in the url is required, got &quot;{id}&quot;</>
  const item = state.items.find(one => one.$id === id)
  if (item === undefined) return <>Item with id &quot;{id}&quot; not found ;(</>
  logger.debug('PageItemDetails', { item })
  const stepsBack = context === 'single' ? 2 : 1 // oxlint-disable-line @typescript-eslint/no-magic-numbers
  setPageTitle(`${item.name} - Details`)

  return (
    <div className="sf-page" data-page="item-details">
      {/* Top nav */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <AppButtonBack stepsBack={stepsBack} />
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="relative flex-1 overflow-auto px-5 pb-28">
        <AppItemDetails item={item} />
      </div>

      {/* Bottom search dock */}
      <AppQuickSearch mode="floating" />
    </div>
  )
}
