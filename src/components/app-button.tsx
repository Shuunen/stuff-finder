import { Button } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { kebabCase } from 'es-toolkit'
import { theme } from '../utils/theme.utils'

type Props = Readonly<{
  color?: 'pastel-1' | 'pastel-2' | 'pastel-3' | 'pastel-4' | 'pastel-5' | 'pastel-6' | 'primary' | 'white'
  disabled?: boolean
  endIcon?: React.ReactNode
  label?: string
  loading?: boolean
  name: string
  onClick?: () => void
  startIcon?: React.ReactNode
  type?: 'button' | 'submit'
  variant?: 'text' | 'outlined'
}>

export function AppButton({ color = 'white', disabled, endIcon, label, loading, name, onClick, startIcon, type = 'button', variant = 'outlined' }: Props) {
  const style = { backgroundColor: variant === 'text' ? 'transparent' : `var(--color-${color})`, color: color === 'primary' ? 'var(--color-white)' : `var(--color-black)` }
  const testId = kebabCase(`app-button-${name}`)
  return (
    <ThemeProvider theme={theme}>
      <Button style={style} disabled={disabled} endIcon={endIcon} loading={loading} data-testid={testId} onClick={onClick} startIcon={startIcon} type={type} variant={variant}>
        {label}
      </Button>
    </ThemeProvider>
  )
}
