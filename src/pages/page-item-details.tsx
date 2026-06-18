import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AppItemDetails } from '../components/app-item-details'
import { setPageTitle } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

export function PageItemDetails() {
  const { id, context } = useParams<{ id: string; context?: string }>()

  useEffect(() => {
    window.scrollTo({ behavior: 'smooth', top: 0 })
  }, [id])

  if (typeof id !== 'string') return <>An id in the url is required, got &quot;{id}&quot;</>
  const item = state.items.find(one => one.$id === id)
  if (item === undefined) return <>Item with id &quot;{id}&quot; not found ;(</>
  logger.debug('PageItemDetails', { item })
  const stepsBack = context === 'single' ? 2 : 1 // oxlint-disable-line @typescript-eslint/no-magic-numbers
  setPageTitle(`${item.name} - Details`)

  return (
    <div className="mx-auto flex flex-col pb-24" data-page="item-details">
      <AppItemDetails item={item} stepsBack={stepsBack} />
    </div>
  )
}
