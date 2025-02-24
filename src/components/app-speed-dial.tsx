import AddIcon from '@mui/icons-material/Add'
import SpeedDialIcon from '@mui/icons-material/EjectOutlined'
import HomeIcon from '@mui/icons-material/Home'
import HourglassTop from '@mui/icons-material/HourglassTop'
import PrintIcon from '@mui/icons-material/Print'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import SettingsIcon from '@mui/icons-material/Settings'
import type { FabProps } from '@mui/material'
import Fade from '@mui/material/Fade'
import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import { route, useRouter } from 'preact-router'
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks'
import { isMobile } from 'shuutils'
import { logger } from '../utils/logger.utils'
import { AppQuickSearch } from './app-quick-search'

const actions = [
  { handleClick: () => route('/'), icon: <HomeIcon />, name: 'Home' },
  { handleClick: () => route('/item/add'), icon: <AddIcon />, name: 'Add' },
  { handleClick: () => route('/settings'), icon: <SettingsIcon />, name: 'Settings' },
  { handleClick: () => route('/print/missing'), icon: <PrintIcon />, name: 'Print' },
  { handleClick: () => route('/scan'), icon: <QrCodeScannerIcon />, name: 'Scan' },
]

// eslint-disable-next-line max-statements
export function AppSpeedDial ({ isLoading = false, isSettingsRequired = false }: Readonly<{ isLoading?: boolean; isSettingsRequired?: boolean }>) {
  const [isOpen, setOpen] = useState(false)
  const toggleOpen = useCallback(() => { setOpen(!isOpen) }, [isOpen])
  const onMouse = useCallback((status: 'enter' | 'leave') => { if (!isMobile()) { logger.debug('open cause mouse', status); setOpen(status === 'enter') } }, [])
  const onMouseEnter = useCallback(() => { onMouse('enter') }, [onMouse])
  const onMouseLeave = useCallback(() => { onMouse('leave') }, [onMouse])
  const options: Partial<FabProps> = { color: 'default', sx: { backgroundColor: 'white', color: 'purple', opacity: 0.7 } } as const
  const icon = useMemo(() => (isLoading ? <HourglassTop /> : <SpeedDialIcon />), [isLoading])
  const availableActions = useMemo(() => (isSettingsRequired ? actions.filter((action) => ['Home', 'Settings'].includes(action.name)) : actions), [isSettingsRequired])
  const [{ path }] = useRouter()
  const [isQuickSearchAvailable, setQuickSearchAvailability] = useState(false)
  useEffect(() => { setQuickSearchAvailability(path !== '/'); setOpen(false) }, [path])
  return (
    <>
      <Fade in={isOpen}>
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
        <div class="absolute bottom-0 right-0 z-10 size-full bg-gradient-to-tl" data-component="speed-dial-backdrop" onClick={toggleOpen} />
      </Fade>
      <div class="pointer-events-none fixed bottom-5 right-5 z-20 flex items-end md:bottom-10 md:right-10 print:hidden" data-component="speed-dial">
        <Fade in={isQuickSearchAvailable}>
          <div class="pointer-events-auto mb-2">
            <AppQuickSearch mode='floating' />
          </div>
        </Fade>
        <SpeedDial ariaLabel='Actions' FabProps={options} icon={icon} onClick={toggleOpen} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} open={isOpen}>
          {availableActions.map((action) => <SpeedDialAction icon={action.icon} key={action.name} onClick={() => { toggleOpen(); action.handleClick() }} tooltipTitle={action.name} />)}
        </SpeedDial>
      </div>
    </>
  )
}
