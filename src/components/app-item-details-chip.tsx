import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import { copyToClipboard } from 'shuutils'
import { delays } from '../constants'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

const chipsStyle = { height: 28, paddingTop: 0.3 }

export function AppItemDetailsChip ({ label, tooltip }: { readonly label: string; readonly tooltip: string }) {

  async function onChipClick (event: React.MouseEvent<HTMLDivElement>) {
    event.stopPropagation()
    logger.debug('onChipClick', { event })
    await copyToClipboard(event.currentTarget.textContent ?? '')
    state.message = { content: `${tooltip} copied to clipboard`, delay: delays.second, type: 'success' }
  }

  return <Tooltip data-component="item-details-chip" title={tooltip}>
    {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
    <Chip label={label} onClick={onChipClick} sx={chipsStyle} variant="outlined" />
  </Tooltip>
}
