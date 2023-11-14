/* eslint-disable react-perf/jsx-no-jsx-as-prop */
import { Add, Print, Settings } from '@mui/icons-material'
import { SpeedDial, SpeedDialAction, SpeedDialIcon, Zoom } from '@mui/material'
import { useState } from 'preact/hooks'
import { emit, on } from 'shuutils'
import type { AppModalAddItemOpenEvent, AppToasterShowEvent, ItemsReadyEvent } from '../types'

const actions = [
  { icon: <Add />, name: 'Add', onClick: () => emit<AppModalAddItemOpenEvent>('app-modal--add-item--open') },
  { icon: <Settings />, name: 'Settings', onClick: () => emit<AppToasterShowEvent>('app-toaster--show', { message: 'Settings clicked', type: 'info' }) },
  { icon: <Print />, name: 'Print', onClick: () => emit<AppToasterShowEvent>('app-toaster--show', { message: 'Print clicked', type: 'info' }) },
]

export function AppSpeedDial () {

  const [isVisible, setIsVisible] = useState(false)

  on<ItemsReadyEvent>('items-ready', () => setIsVisible(true))

  return (
    <Zoom in={isVisible}>
      <div className="absolute bottom-10 right-10 z-10">
        {/* @ts-expect-error typings issue */}
        <SpeedDial ariaLabel='Actions' icon={<SpeedDialIcon />}>
          {/* @ts-expect-error typings issue */}
          {actions.map((action) => /* @ts-expect-error typings issue */ (
            <SpeedDialAction icon={action.icon} key={action.name} onClick={() => action.onClick()} tooltipTitle={action.name} />
          ))}
        </SpeedDial>
      </div>
    </Zoom>
  )
}
