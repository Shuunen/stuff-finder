import type { Item } from '../types/item.types'
import { boxToColor, boxToLetter } from '../utils/box.utils'

const drawerPadLength = 2

type Props = Readonly<{
  box: Item['box']
  className?: string
  drawer?: Item['drawer']
  rotate?: number
}>

export function AppLocSticker({ box, drawer, rotate = 0, className = '' }: Props) {
  const letter = boxToLetter(box)
  const color = boxToColor(box)
  const drawerStr = drawer !== undefined && drawer >= 0 ? String(drawer).padStart(drawerPadLength, '0') : undefined

  return (
    <div
      className={`inline-flex shrink-0 items-center gap-2.5 rounded-[14px] border-2 border-black py-1.5 pr-3 pl-1.5 font-display text-[18px] font-bold whitespace-nowrap shadow-[3px_3px_0_var(--color-black)] ${className}`}
      style={{ background: color, transform: rotate ? `rotate(${rotate}deg)` : undefined }}
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2 border-black bg-white text-[18px] font-bold text-black">{letter}</div>
      {drawerStr !== undefined && <span className="text-black">{`drawer ${drawerStr}`}</span>}
    </div>
  )
}
