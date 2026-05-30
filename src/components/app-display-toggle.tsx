import GridViewIcon from '@mui/icons-material/GridView'
import ViewListIcon from '@mui/icons-material/ViewList'
import { useCallback, useState } from 'react'
import type { Display } from '../types/theme.types'
import { state } from '../utils/state.utils'

export function AppDisplayToggle() {
  const [display, setDisplay] = useState<Display>(state.display)

  const changeDisplay = useCallback((chosen: Display) => {
    setDisplay(chosen)
    state.display = chosen
  }, [])

  return (
    <div aria-label="display" className="view-toggle">
      <button aria-label="card view" className={`view-toggle-btn ${display === 'card' ? 'active' : ''}`} onClick={() => changeDisplay('card')} type="button">
        <GridViewIcon fontSize="small" />
      </button>
      <button aria-label="list view" className={`view-toggle-btn ${display === 'list' ? 'active' : ''}`} onClick={() => changeDisplay('list')} type="button">
        <ViewListIcon fontSize="small" />
      </button>
    </div>
  )
}
