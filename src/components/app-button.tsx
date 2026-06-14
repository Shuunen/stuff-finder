import { Button } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { kebabCase } from 'es-toolkit'
import type { Colors } from '../types/theme.types'
import { theme } from '../utils/theme.utils'

type Props = Readonly<{
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

export function AppButton({ color = 'white', className, disabled, endIcon, label, loading, name, onClick, startIcon, type = 'button', variant = 'outlined' }: Props) {
  const style = { backgroundColor: variant === 'text' ? 'transparent' : `var(--color-${color})`, color: color === 'primary' ? 'var(--color-white)' : `var(--color-black)` }
  const testId = kebabCase(`app-button-${name}`)
  return (
    <ThemeProvider theme={theme}>
      <Button className={className} style={style} disabled={disabled} endIcon={endIcon} loading={loading} data-testid={testId} onClick={onClick} startIcon={startIcon} type={type} variant={variant}>
        {label}
      </Button>
    </ThemeProvider>
  )
}
