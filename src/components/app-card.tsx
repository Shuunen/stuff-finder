import { kebabCase } from 'es-toolkit'
import { cn } from 'shuutils'
import { appBoxClasses } from '../utils/theme.utils'

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
    <div className={cn(appBoxClasses.base, `flex flex-col gap-6 rounded-xl bg-white p-4`, appBoxClasses.deepShadow, hover && appBoxClasses.hover, className)} data-testid={kebabCase(`app-card-${name}`)}>
      {children}
    </div>
  )
}
