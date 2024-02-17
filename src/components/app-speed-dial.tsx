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
import { useState } from 'preact/hooks'
import { scout } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'

const actions = [
  { handleClick: () => route('/'), icon: <HomeIcon />, name: 'Home' },
  { handleClick: () => route('/item/add'), icon: <AddIcon />, name: 'Add' },
  { handleClick: () => route('/settings'), icon: <SettingsIcon />, name: 'Settings' },
  { handleClick: () => route('/print/missing'), icon: <PrintIcon />, name: 'Print' },
  { handleClick: () => route('/scan'), icon: <QrCodeScannerIcon />, name: 'Scan' },
]

export function AppSpeedDial ({ isLoading }: { readonly isLoading: boolean }) {

  const [isOpen, setOpen] = useState(false)
  function toggleOpen (reason = 'unknown') { logger.debug('toggle cause', reason); setOpen(!isOpen) }
  function onMouse (status: 'enter' | 'leave') { if (!scout.isMobile) { logger.debug('open cause mouse', status); setOpen(status === 'enter') } }

  return (
    <>
      <Fade in={isOpen}>
        <div className="absolute bottom-0 right-0 z-10 size-full bg-black/30" data-component="speed-dial-backdrop" onClick={() => toggleOpen('click on div backdrop')} />
      </Fade>
      <div className="fixed bottom-10 right-10 z-20 print:hidden" data-component="speed-dial">
        <SpeedDial ariaLabel='Actions' FabProps={{ color: isLoading ? 'warning' : 'primary' }} icon={isLoading ? <HourglassTop /> : <SpeedDialIcon />} onClick={() => toggleOpen('click on dial')} onMouseEnter={() => onMouse('enter')} onMouseLeave={() => onMouse('leave')} open={isOpen}>
          {actions.map((action) => (
            <SpeedDialAction icon={action.icon} key={action.name} onClick={action.handleClick} tooltipTitle={action.name} />
          ))}
        </SpeedDial>
      </div>
    </>
  )
}
