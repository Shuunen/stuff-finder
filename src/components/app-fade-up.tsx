import type { ReactNode } from 'react'
import { cn } from '../utils/class.utils'

type Props = Readonly<{
  children: ReactNode
  className?: string
  /** Delay in milliseconds before the content fades in */
  delay?: number
}>

/**
 * Make its content fade in and rise when it appears, to be used for the blocks of a page
 * @param props the component props
 * @param props.children the content to animate
 * @param props.className extra classes for the wrapper
 * @param props.delay delay in milliseconds before the content fades in
 * @returns the animated wrapper
 */
export function AppFadeUp({ children, className, delay = 0 }: Props) {
  return (
    <div className={cn('animate-fade-up', className)} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}
