import ArrowBack from '@mui/icons-material/ArrowBack'
import Button from '@mui/material/Button'
import { useCallback } from 'preact/hooks'

const previous = -1

export function AppButtonBack ({ stepsBack = 1 }: Readonly<{ stepsBack?: number }>) {

  const goBack = useCallback(() => {
    globalThis.history.go(previous * stepsBack)
  }, [stepsBack])

  return (
    <Button
      onClick={goBack}
      startIcon={<ArrowBack />}
      type="button"
      variant="outlined"
    >
      Back
    </Button>
  )
}
