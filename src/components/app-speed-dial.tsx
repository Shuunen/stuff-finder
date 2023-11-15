/* eslint-disable react-perf/jsx-no-jsx-as-prop */
import { Add, Print, Settings } from '@mui/icons-material'
import { Fade, SpeedDial, SpeedDialAction, SpeedDialIcon, Zoom } from '@mui/material'
import { useState } from 'preact/hooks'
import { emit, on } from 'shuutils'
import type { AppModalAddItemOpenEvent, AppToasterShowEvent, ItemsReadyEvent } from '../types'

const actions = [
  { handleClick: () => emit<AppModalAddItemOpenEvent>('app-modal--add-item--open'), icon: <Add />, name: 'Add' },
  { handleClick: () => emit<AppToasterShowEvent>('app-toaster--show', { message: 'Settings clicked', type: 'info' }), icon: <Settings />, name: 'Settings' },
  { handleClick: () => emit<AppToasterShowEvent>('app-toaster--show', { message: 'Print clicked', type: 'info' }), icon: <Print />, name: 'Print' },
]

export function AppSpeedDial () {

  const [isVisible, setIsVisible] = useState(false)
  const [isOpen, setOpen] = useState(false)
  function toggleOpen () { setOpen(!isOpen) }

  on<ItemsReadyEvent>('items-ready', () => setIsVisible(true))

  return (
    <>
      <Fade in={isOpen}>
        <div className="absolute bottom-0 right-0 z-10 h-screen w-screen" onClick={toggleOpen} />
      </Fade>
      <Zoom in={isVisible}>
        <div className="absolute bottom-10 right-10 z-20">
          {/* @ts-expect-error typings issue */}
          <SpeedDial ariaLabel='Actions' icon={<SpeedDialIcon />} onClick={toggleOpen} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} open={isOpen}>
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
