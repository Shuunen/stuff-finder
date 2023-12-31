import AddIcon from '@mui/icons-material/Add'
import SpeedDialIcon from '@mui/icons-material/EjectOutlined'
import HomeIcon from '@mui/icons-material/Home'
import PrintIcon from '@mui/icons-material/Print'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import SettingsIcon from '@mui/icons-material/Settings'
import Fade from '@mui/material/Fade'
import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import Zoom from '@mui/material/Zoom'
import { route } from 'preact-router'
import { useState } from 'preact/hooks'
import { scout } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'
import { state, watchState } from '../utils/state.utils'

const actions = [
  { handleClick: () => route('/'), icon: <HomeIcon />, name: 'Home' },
  { handleClick: () => route('/item/add'), icon: <AddIcon />, name: 'Add' },
  { handleClick: () => route('/settings'), icon: <SettingsIcon />, name: 'Settings' },
  { handleClick: () => route('/print/missing'), icon: <PrintIcon />, name: 'Print' },
  { handleClick: () => route('/scan'), icon: <QrCodeScannerIcon />, name: 'Scan' },
]

export function AppSpeedDial () {

  const [isVisible, setIsVisible] = useState(false)
  const [isOpen, setOpen] = useState(false)
  function toggleOpen (reason = 'unknown') { logger.debug('toggle cause', reason); setOpen(!isOpen) }
  watchState('status', () => setIsVisible(state.status === 'ready'))

  return (
    <>
      <Fade in={isOpen}>
        <div className="absolute bottom-0 right-0 z-10 h-screen w-screen bg-black/30" data-component="speed-dial-backdrop" onClick={() => toggleOpen('click on div backdrop')} />
      </Fade>
      <Zoom in={isVisible}>
        <div className="fixed bottom-10 right-10 z-20" data-component="speed-dial">
          {/* @ts-expect-error typings issue */}
          <SpeedDial ariaLabel='Actions' icon={<SpeedDialIcon />} onClick={() => toggleOpen('click on dial')} onMouseEnter={() => { if (!scout.isMobile) { logger.debug('open cause mouse enter'); setOpen(true) } }} onMouseLeave={() => { if (!scout.isMobile) { logger.debug('close cause mouse leave'); setOpen(false) } }} open={isOpen}>
            {/* @ts-expect-error typings issue */}
            {actions.map((action) => /* @ts-expect-error typings issue */ (
              <SpeedDialAction icon={action.icon} key={action.name} onClick={action.handleClick} tooltipTitle={action.name} />
            ))}
          </SpeedDial>
        </div>
      </Zoom>
    </>
  )
}
