import AddIcon from '@mui/icons-material/Add'
import SpeedDialIcon from '@mui/icons-material/EjectOutlined'
import HomeIcon from '@mui/icons-material/Home'
import HourglassTop from '@mui/icons-material/HourglassTop'
import PrintIcon from '@mui/icons-material/Print'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import SettingsIcon from '@mui/icons-material/Settings'
import Fade from '@mui/material/Fade'
import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import { route } from 'preact-router'
import { useCallback, useMemo, useState } from 'preact/hooks'
import { isMobile } from 'shuutils'
import { logger } from '../utils/logger.utils'

const actions = [
  { handleClick: () => route('/'), icon: <HomeIcon />, name: 'Home' },
  { handleClick: () => route('/item/add'), icon: <AddIcon />, name: 'Add' },
  { handleClick: () => route('/settings'), icon: <SettingsIcon />, name: 'Settings' },
  { handleClick: () => route('/print/missing'), icon: <PrintIcon />, name: 'Print' },
  { handleClick: () => route('/scan'), icon: <QrCodeScannerIcon />, name: 'Scan' },
]

export function AppSpeedDial ({ isLoading, isSettingsRequired }: Readonly<{ isLoading: boolean; isSettingsRequired: boolean }>) {

  const [isOpen, setOpen] = useState(false)
  const toggleOpen = useCallback(() => { setOpen(!isOpen) }, [isOpen])
  const onMouse = useCallback((status: 'enter' | 'leave') => { if (!isMobile()) { logger.debug('open cause mouse', status); setOpen(status === 'enter') } }, [])
  const onMouseEnter = useCallback(() => { onMouse('enter') }, [onMouse])
  const onMouseLeave = useCallback(() => { onMouse('leave') }, [onMouse])
  const options = useMemo(() => ({ color: isLoading ? 'warning' : 'primary' } as const), [isLoading])
  const icon = useMemo(() => (isLoading ? <HourglassTop /> : <SpeedDialIcon />), [isLoading])
  const availableActions = useMemo(() => (isSettingsRequired ? actions.filter((action) => ['Home', 'Settings'].includes(action.name)) : actions), [isSettingsRequired])
  return (
    <>
      <Fade in={isOpen}>
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
        <div className="absolute bottom-0 right-0 z-10 size-full bg-black/30" data-component="speed-dial-backdrop" onClick={toggleOpen} />
      </Fade>
      <div className="fixed bottom-10 right-10 z-20 print:hidden" data-component="speed-dial">
        <SpeedDial FabProps={options} ariaLabel='Actions' icon={icon} onClick={toggleOpen} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} open={isOpen}>
          {availableActions.map((action) => <SpeedDialAction icon={action.icon} key={action.name} onClick={action.handleClick} tooltipTitle={action.name} />)}
        </SpeedDial>
      </div>
    </>
  )
}
