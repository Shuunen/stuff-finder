import { ArrowLeft } from '@mui/icons-material'
import { Button } from '@mui/material'
import { useCallback } from 'react'

const previous = -1

export function AppButtonBack({ stepsBack = 1 }: Readonly<{ stepsBack?: number }>) {
  const goBack = useCallback(() => {
    globalThis.history.go(previous * stepsBack)
  }, [stepsBack])

  return (
    <Button name="back" onClick={goBack} variant="outlined">
      <ArrowLeft />
      Back
    </Button>
  )
}
