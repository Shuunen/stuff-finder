import { useCallback } from 'react'
import { navigate } from '../utils/navigation.utils'
import { AppButton } from './app-button'

export function AppButtonNext({ label = 'Home', type = 'button', url = '/' }: Readonly<{ label?: string; type?: 'button' | 'submit'; url?: string }>) {
  const onClick = useCallback(() => {
    navigate(url)
  }, [url])
  return <AppButton color="pastel-3" label={label} name="next" onClick={onClick} type={type} />
}
