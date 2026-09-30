import { cn } from '../utils/class.utils'

export function AppTape({ className }: { className?: string }) {
  return <div className={cn('pointer-events-none aspect-video h-12 origin-left animate-tape-apply border border-black/19 bg-pastel-5 opacity-70 shadow', className)} />
}
