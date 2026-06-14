import { Button } from '@mui/material'
import { kebabCase } from 'es-toolkit'
import type { Colors } from '../types/theme.types'

type Props = Readonly<{
  'aria-controls'?: string
  'aria-expanded'?: 'true' | 'false'
  'aria-haspopup'?: 'true' | 'false' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
  color?: Colors
  className?: string
  disabled?: boolean
  endIcon?: React.ReactNode
  label?: string
  loading?: boolean
  name: string
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void
  startIcon?: React.ReactNode
  type?: 'button' | 'submit'
  variant?: 'text' | 'outlined'
}>

export function AppButton({ color = 'white', label, name, variant = 'outlined', ...rest }: Props) {
  const ariaLabel = label ? `${name} button` : undefined
  const testId = kebabCase(`app-button-${name}`)
  const style = { backgroundColor: variant === 'text' ? 'transparent' : `var(--color-${color})`, color: color === 'primary' ? 'var(--color-white)' : `var(--color-black)` }
  const props = { 'aria-label': ariaLabel, 'data-testid': testId, style, variant, ...rest }
  return <Button {...props}>{label}</Button>
}
