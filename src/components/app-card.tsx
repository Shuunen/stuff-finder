import { kebabCase } from 'es-toolkit'
import { cn } from 'shuutils'

type AppCardProperties = {
  /** Optional additional class name */
  className?: string
  /** Content of the card */
  children: React.ReactNode
  /** Optional, activate hover effect */
  hover?: boolean
  /** Name of the card for testing */
  name: string
}

export function AppCard({ children, className, hover, name }: Readonly<AppCardProperties>) {
  return (
    <div
      className={cn(`border-ink relative flex flex-col gap-6 rounded-xl border-2 bg-white p-4 shadow-[3px_3px_0_var(--color-black)] transition`, hover && 'hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--color-black)]', className)}
      data-testid={kebabCase(`app-card-${name}`)}
    >
      {children}
    </div>
  )
}
