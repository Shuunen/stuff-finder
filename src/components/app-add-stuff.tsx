import AddIcon from '@mui/icons-material/Add'
import { Fab, Zoom } from '@mui/material'
import { useState } from 'preact/hooks'
import { emit, on } from 'shuutils'
import type { AppModalAddItemOpenEvent, ItemsReadyEvent } from '../types'

const fabStyle = {
  opacity: 0.9,
}

export function AppAddStuff () {

  const [isVisible, setIsVisible] = useState(false)

  on<ItemsReadyEvent>('items-ready', () => setIsVisible(true))

  return (
    <Zoom in={isVisible}>
      <div className="fixed bottom-10 right-10">
        <Fab
          aria-label="Add new item"
          color="primary"
          onClick={() => emit<AppModalAddItemOpenEvent>('app-modal--add-item--open')}
          sx={fabStyle}
          title="Add new item"
        >
          {/* @ts-expect-error typings issue */}
          <AddIcon />
        </Fab>
      </div>
    </Zoom>
  )
}
