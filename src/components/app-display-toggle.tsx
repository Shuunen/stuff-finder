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
    <div aria-label="display" className="view-toggle">
      <AppButton name="card-view" onClick={() => changeDisplay('card')} startIcon={<GridViewIcon fontSize="small" />} variant={display === 'card' ? 'outlined' : 'text'} />
      <AppButton name="list-view" onClick={() => changeDisplay('list')} startIcon={<ViewListIcon fontSize="small" />} variant={display === 'list' ? 'outlined' : 'text'} />
    </div>
  )
}
