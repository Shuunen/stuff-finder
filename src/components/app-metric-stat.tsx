import type { MuiIcon } from '../types/icons.types'
import { cn } from '../utils/class.utils'
import { AppCard } from './app-card'

const iconStyle = { fontSize: '3rem' }

type Props = Readonly<{
  /** The big number or text */
  amount: number | string
  /** Tailwind background class, from the semantic palette */
  background: string
  /** Icon shown next to the amount */
  icon: MuiIcon
  /** What the amount is about */
  label: string
}>

export function AppMetricStat({ amount, background, icon: Icon, label }: Props) {
  return (
    <AppCard name={`metric-card-${label}`} className={cn('h-full flex-row items-center justify-center gap-4', background)}>
      <Icon className="opacity-60" sx={iconStyle} />
      <div className="grid gap-1">
        <p className="text-3xl leading-none font-bold whitespace-nowrap">{amount}</p>
        <em>{label}</em>
      </div>
    </AppCard>
  )
}
