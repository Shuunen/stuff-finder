import { kebabCase } from 'es-toolkit'
import { cn } from 'shuutils'
import { appBoxClasses } from '../utils/theme.utils'

type AppPillProperties = {
  /** Optional, background color */
  background?: string
  /** Optional, additional class name */
  className?: string
  /** Optional, content of the pill */
  children?: React.ReactNode
  /** Optional, activate hover effect */
  hover?: boolean
  /** Name of the pill for accessibility */
  name: string
  /** Optional, when true, avoid the deep shadow effect */
  shallow?: boolean
}

export function AppPill({ children, className, hover, shallow, background, name }: Readonly<AppPillProperties>) {
  return (
    <div
      className={cn(
        appBoxClasses.base,
        `inline-flex items-center rounded-full px-3 py-1 font-mono text-sm font-bold whitespace-nowrap focus-within:border-primary focus-within:shadow-[4px_4px_0_var(--color-primary)]`,
        shallow ? 'border' : appBoxClasses.deepShadow,
        hover && appBoxClasses.hover,
        className,
      )}
      style={{ background }}
      aria-label={name}
      data-testid={kebabCase(`app-pill-${name}`)}
    >
      {children}
    </div>
  )
}
