import Button from '@mui/material/Button'

const previous = -1

export function AppButtonBack () {
  return (
    <Button onClick={() => window.history.go(previous)} type="button" variant="outlined">Back</Button>
  )
}
