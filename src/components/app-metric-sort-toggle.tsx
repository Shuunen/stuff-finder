import type { BoxSortCriteria } from '../pages/page-metrics.utils'
import { AppButton } from './app-button'

const sortOptions: readonly { criteria: BoxSortCriteria; label: string }[] = [
  { criteria: 'name', label: 'By name' },
  { criteria: 'value', label: 'By value' },
  { criteria: 'items', label: 'By items' },
]

type Props = Readonly<{
  criteria: BoxSortCriteria
  onChange: (criteria: BoxSortCriteria) => void
}>

export function AppMetricSortToggle({ criteria, onChange }: Props) {
  return (
    <div className="flex gap-2" data-testid="metric-storage-sort">
      {sortOptions.map(option => (
        <AppButton color={option.criteria === criteria ? 'pastel-1' : 'white'} key={option.criteria} label={option.label} name={`sort-${option.criteria}`} onClick={() => onChange(option.criteria)} />
      ))}
    </div>
  )
}
