import ViewListIcon from '@mui/icons-material/ViewList'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useCallback, useMemo, useState } from 'preact/hooks'
import type { Display } from '../types/theme.types'
import { state } from '../utils/state.utils'

export function AppDisplayToggle () {

  const [display, setDisplay] = useState<Display>(state.display)
  const toggleButtonStyles = useMemo(() => ({ padding: 0.3 }), [])

  // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention
  const changeDisplay = useCallback((_event: MouseEvent, chosenDisplay: Display) => {
    setDisplay(chosenDisplay)// eslint-disable-next-line functional/immutable-data
    state.display = chosenDisplay
  }, [])

  return (
    <ToggleButtonGroup aria-label="display" exclusive onChange={changeDisplay} value={display}>
      <ToggleButton aria-label="list view" sx={toggleButtonStyles} value="list">
        <ViewListIcon />
      </ToggleButton>
      <ToggleButton aria-label="card view" sx={toggleButtonStyles} value="card">
        <ViewModuleIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  )
}
