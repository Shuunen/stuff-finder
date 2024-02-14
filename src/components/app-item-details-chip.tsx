import Chip, { type ChipOwnProps } from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import { route } from 'preact-router'
import { copyToClipboard } from 'shuutils'
import { delays } from '../constants'
import type { MuiIcon } from '../types/icons.types'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

const chipsStyle = { height: 28, paddingTop: 0.3 }

// eslint-disable-next-line @typescript-eslint/naming-convention, react/require-default-props
export function AppItemDetailsChip ({ color = 'default', icon: Icon, label, link, tooltip }: { readonly color?: ChipOwnProps['color']; readonly icon?: MuiIcon | undefined; readonly label: string; readonly link?: string; readonly tooltip: string }) {

  async function onChipClick (event: MouseEvent) {
    event.stopPropagation()
    logger.debug('onChipClick', { event })
    if (link !== undefined) { route(link); return }
    const target = event.currentTarget as HTMLElement // eslint-disable-line @typescript-eslint/consistent-type-assertions
    await copyToClipboard(target.textContent ?? '')
    state.message = { content: `${tooltip} copied to clipboard`, delay: delays.second, type: 'success' }
  }

  const attributes: Record<string, unknown> = {}
  if (Icon !== undefined) {
    attributes.icon = <Icon />
    attributes.className = 'reverse' // eslint-disable-line unicorn/no-keyword-prefix
  }

  return <Tooltip data-component="item-details-chip" title={tooltip}>
    {/* eslint-disable-next-line react/jsx-props-no-spreading, @typescript-eslint/no-misused-promises */}
    <Chip {...attributes} color={color} label={label} onClick={onChipClick} sx={chipsStyle} variant="outlined" />
  </Tooltip>
}
