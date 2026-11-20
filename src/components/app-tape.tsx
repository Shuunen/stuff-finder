import type { CSSProperties } from 'react'
import { cn } from '../utils/class.utils'

const leftEdge = ['0px 0px', '6px 8%', '1px 17%', '7px 26%', '0px 35%', '5px 44%', '1px 53%', '8px 62%', '2px 71%', '6px 80%', '0px 90%', '4px 100%']
const rightEdge = [
  'calc(100% - 5px) 100%',
  '100% 91%',
  'calc(100% - 7px) 82%',
  'calc(100% - 1px) 73%',
  'calc(100% - 6px) 64%',
  '100% 55%',
  'calc(100% - 8px) 46%',
  'calc(100% - 2px) 37%',
  'calc(100% - 5px) 28%',
  '100% 19%',
  'calc(100% - 6px) 9%',
  'calc(100% - 1px) 0px',
]
// torn ends like a real piece of tape cut by hand
const tornShape = { clipPath: `polygon(${[...leftEdge, ...rightEdge].join(', ')})` } satisfies CSSProperties

export function AppTape({ className }: Readonly<{ className?: string }>) {
  // the shadow lives on the outer element because the clip-path of the inner one would cut it
  // the outer background is not painted (clipped to its empty text), the inner element inherits its color
  return (
    <div data-testid="app-tape" className={cn('pointer-events-none aspect-video h-12 origin-left animate-tape-apply bg-pastel-5 bg-clip-text opacity-70 drop-shadow-sm', className)}>
      <div className="h-full w-full border border-black/19 bg-inherit" style={tornShape} />
    </div>
  )
}
