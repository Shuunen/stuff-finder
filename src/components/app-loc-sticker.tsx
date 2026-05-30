import type { Item } from '../types/item.types'
import { boxToColor, boxToLetter } from '../utils/box.utils'

const drawerPadLength = 2

type Props = Readonly<{
  box: Item['box']
  className?: string
  drawer?: Item['drawer']
  rotate?: number
  size?: 'lg' | 'sm'
}>

export function AppLocSticker({ box, drawer, size = 'sm', rotate = 0, className = '' }: Props) {
  const letter = boxToLetter(box)
  const color = boxToColor(box)
  const isLg = size === 'lg'
  const drawerStr = drawer !== undefined && drawer >= 0 ? String(drawer).padStart(drawerPadLength, '0') : undefined

  return (
    <div className={`loc-sticker ${isLg ? 'loc-sticker-lg' : ''} ${className}`} style={{ background: color, transform: rotate ? `rotate(${rotate}deg)` : undefined }}>
      <div className="loc-sticker-letter">{letter}</div>
      {drawerStr !== undefined && <span>{isLg ? `drawer ${drawerStr}` : `· ${drawerStr}`}</span>}
    </div>
  )
}
