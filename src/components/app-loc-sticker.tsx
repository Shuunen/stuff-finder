import Tooltip from '@mui/material/Tooltip'
import type { KeyboardEvent, MouseEvent } from 'react'
import { unknownBoxName } from '../pages/page-metrics.utils'
import type { Item } from '../types/item.types'
import { boxToColor, boxToLetter, isSingleLetterBox } from '../utils/box.utils'
import { navigate } from '../utils/navigation.utils'

const drawerPadLength = 2

function boxToUrl(box: Item['box'], drawer: Item['drawer'] | undefined) {
  const boxUrl = `/box/${encodeURIComponent(box.trim() === '' ? unknownBoxName : box)}`
  return drawer !== undefined && drawer >= 0 ? `${boxUrl}/${drawer}` : boxUrl
}

// the sticker can be inside a link (item list entry), so it is not an anchor itself to avoid nesting links
function goTo(url: string, event: KeyboardEvent | MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  navigate(url)
}

type Props = Readonly<{
  box: Item['box']
  className?: string
  drawer?: Item['drawer']
  hideParentheses?: boolean
  rotate?: number
}>

export function AppLocSticker({ box, drawer, hideParentheses = false, rotate = 0, className = '' }: Props) {
  const drawerStr = drawer !== undefined && drawer >= 0 ? String(drawer).padStart(drawerPadLength, '0') : undefined
  const trimmedBox = box.trim()
  const isSingleLetter = isSingleLetterBox(box)
  const label = isSingleLetter ? boxToLetter(box) : trimmedBox
  const rawDescription = isSingleLetter ? trimmedBox.slice(1).trim() : ''
  const boxDescription = hideParentheses ? rawDescription.replace(/^\((?<inner>.*)\)$/u, '$<inner>').trim() : rawDescription
  const sideText = drawerStr === undefined ? boxDescription : `drawer ${drawerStr}`
  const hasSideText = sideText !== ''
  const hiddenFullName = isSingleLetter && drawerStr !== undefined && boxDescription !== '' ? trimmedBox : ''
  const color = boxToColor(box)
  const drawerUrl = boxToUrl(box, drawer)
  const boxUrl = boxToUrl(box, undefined)

  return (
    <div
      data-testid="app-loc-sticker"
      onClick={event => goTo(drawerUrl, event)}
      onKeyDown={event => event.key === 'Enter' && goTo(drawerUrl, event)}
      role="link"
      tabIndex={0}
      className={`inline-flex shrink-0 cursor-pointer items-center gap-2.5 rounded-[14px] border-2 border-black py-1.5 pl-1.5 ${hasSideText ? 'pr-3' : 'pr-1.5'} font-display text-[18px] font-bold whitespace-nowrap shadow-[3px_3px_0_var(--color-black)] ${className}`}
      style={{ background: color, transform: rotate ? `rotate(${rotate}deg)` : undefined }}
    >
      <Tooltip arrow title={hiddenFullName}>
        <div
          data-testid="app-loc-sticker-letter"
          onClick={event => goTo(boxUrl, event)}
          className={`grid h-9 shrink-0 place-items-center rounded-lg border-2 border-black bg-white text-[18px] font-bold text-black ${isSingleLetter ? 'w-9' : 'min-w-9 px-2.5'}`}
        >
          {label}
        </div>
      </Tooltip>
      {hasSideText && (
        <span className="text-black" data-testid={drawerStr === undefined ? 'app-loc-sticker-description' : 'app-loc-sticker-drawer'}>
          {sideText}
        </span>
      )}
    </div>
  )
}
