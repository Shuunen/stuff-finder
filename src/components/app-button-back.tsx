import Button from '@mui/material/Button'
import { useCallback } from 'preact/hooks'

const previous = -1

export function AppButtonBack ({ stepsBack = 1 }: Readonly<{ stepsBack?: number }>) {

  const goBack = useCallback(() => {
    window.history.go(previous * stepsBack)
  }, [stepsBack])

  return (
    <Button onClick={goBack} type="button" variant="outlined">Back</Button>
  )
}
