import { cn } from 'shuutils'

export function AppTape({ className }: { className?: string }) {
  return <div className={cn('pointer-events-none aspect-video h-12 border border-black/19 bg-pastel-5 opacity-70', className)} />
}
