import Button from '@mui/material/Button'
import { route } from 'preact-router'

export function AppButtonNext ({ label = 'Home', type = 'button', url = '/' }: { readonly label?: string; readonly type?: 'button' | 'submit'; readonly url?: string }) {
  return (
    <Button onClick={() => route(url)} type={type} variant="contained">{label}</Button>
  )
}
