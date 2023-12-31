import Button from '@mui/material/Button'

const previous = -1

export function AppButtonBack ({ stepsBack = 1 }: { readonly stepsBack?: number }) {
  return (
    <Button onClick={() => window.history.go(previous * stepsBack)} type="button" variant="outlined">Back</Button>
  )
}
