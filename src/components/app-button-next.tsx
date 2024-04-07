import Button from '@mui/material/Button'
import { route } from 'preact-router'
import { useCallback } from 'preact/hooks'

export function AppButtonNext ({ label = 'Home', type = 'button', url = '/' }: Readonly<{ label?: string; type?: 'button' | 'submit'; url?: string }>) {
  const onClick = useCallback(() => { route(url) }, [url])
  return (
    <Button onClick={onClick} type={type} variant="contained">{label}</Button>
  )
}
