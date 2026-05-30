import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import { Button } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { useCallback } from 'react'
import { theme } from '../utils/theme.utils'

const previous = -1

export function AppButtonBack({ stepsBack = 1 }: Readonly<{ stepsBack?: number }>) {
  const goBack = useCallback(() => {
    globalThis.history.go(previous * stepsBack)
  }, [stepsBack])

  return (
    <ThemeProvider theme={theme}>
      <Button name="back" startIcon={<ChevronLeftIcon />} onClick={goBack} type="button" variant="outlined">
        Back
      </Button>
    </ThemeProvider>
  )
}
