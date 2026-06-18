import { kebabCase } from 'es-toolkit'
import { cn } from 'shuutils'

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
        `border-ink relative inline-flex items-center rounded-full px-3 py-1 font-mono text-sm font-bold whitespace-nowrap transition focus-within:border-primary focus-within:shadow-[4px_4px_0_var(--color-primary)]`,
        shallow ? 'border' : 'border-2 shadow-[3px_3px_0_var(--color-black)]',
        hover && 'hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--color-black)]',
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
