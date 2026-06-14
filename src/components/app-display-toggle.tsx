import GridViewIcon from '@mui/icons-material/GridView'
import ViewListIcon from '@mui/icons-material/ViewList'
import { useCallback, useState } from 'react'
import type { Display } from '../types/theme.types'
import { state } from '../utils/state.utils'
import { AppButton } from './app-button'

export function AppDisplayToggle() {
  const [display, setDisplay] = useState<Display>(state.display)

  const changeDisplay = useCallback((chosen: Display) => {
    setDisplay(chosen)
    state.display = chosen
  }, [])

  return (
    <AppButton
      className="hidden! md:flex!"
      name="display-toggle"
      label={display === 'card' ? 'List View' : 'Card View'}
      onClick={() => changeDisplay(display === 'card' ? 'list' : 'card')}
      startIcon={display === 'card' ? <ViewListIcon fontSize="small" /> : <GridViewIcon fontSize="small" />}
    />
  )
}
