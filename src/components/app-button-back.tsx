import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import { useCallback } from 'react'
import { AppButton } from './app-button'

const previous = -1

export function AppButtonBack({ stepsBack = 1 }: Readonly<{ stepsBack?: number }>) {
  const goBack = useCallback(() => {
    globalThis.history.go(previous * stepsBack)
  }, [stepsBack])

  return <AppButton label="Back" name="back" onClick={goBack} startIcon={<ChevronLeftIcon />} />
}
