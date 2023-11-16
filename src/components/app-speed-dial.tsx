/* eslint-disable react-perf/jsx-no-jsx-as-prop */
import AddIcon from '@mui/icons-material/Add'
import PrintIcon from '@mui/icons-material/Print'
import SettingsIcon from '@mui/icons-material/Settings'
import Fade from '@mui/material/Fade'
import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import SpeedDialIcon from '@mui/material/SpeedDialIcon'
import Zoom from '@mui/material/Zoom'
import { useState } from 'preact/hooks'
import { emit, on } from 'shuutils'
import type { AppModalAddItemOpenEvent, AppToasterShowEvent, ItemsReadyEvent } from '../types'
import { scout } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'

const actions = [
  { handleClick: () => emit<AppModalAddItemOpenEvent>('app-modal--add-item--open'), icon: <AddIcon />, name: 'Add' },
  { handleClick: () => emit<AppToasterShowEvent>('app-toaster--show', { message: 'Settings clicked', type: 'info' }), icon: <SettingsIcon />, name: 'Settings' },
  { handleClick: () => emit<AppToasterShowEvent>('app-toaster--show', { message: 'Print clicked', type: 'info' }), icon: <PrintIcon />, name: 'Print' },
]

export function AppSpeedDial () {

  const [isVisible, setIsVisible] = useState(false)
  const [isOpen, setOpen] = useState(false)
  function toggleOpen (reason = 'unknown') { logger.debug('toggle cause', reason); setOpen(!isOpen) }

  on<ItemsReadyEvent>('items-ready', () => setIsVisible(true))

  return (
    <>
      <Fade in={isOpen}>
        <div className="absolute bottom-0 right-0 z-10 h-screen w-screen" onClick={() => toggleOpen('click on div backdrop')} />
      </Fade>
      <Zoom in={isVisible}>
        <div className="absolute bottom-10 right-10 z-20">
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
