import Chip, { type ChipOwnProps } from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import { route } from 'preact-router'
import { useCallback } from 'preact/hooks'
import { copyToClipboard } from 'shuutils'
import { delays } from '../constants'
import type { MuiIcon } from '../types/icons.types'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

type Properties = Readonly<{
  color?: ChipOwnProps['color']
  icon?: MuiIcon | undefined
  label: string
  link?: string
  tooltip: string
}>

const chipsStyle = { height: 28, paddingTop: 0.3 }

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/prefer-readonly-parameter-types
export function AppItemDetailsChip ({ color = 'default', icon: Icon, label, link, tooltip }: Properties) {

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  const onChipClick = useCallback(async (event: MouseEvent) => {
    event.stopPropagation()
    logger.debug('onChipClick', { event })
    if (link !== undefined) { route(link); return }
    const target = event.currentTarget as HTMLElement // eslint-disable-line @typescript-eslint/consistent-type-assertions
    await copyToClipboard(target.textContent ?? '')
    state.message = { content: `${tooltip} copied to clipboard`, delay: delays.second, type: 'success' }
  }, [link, tooltip])

  const attributes: Record<string, unknown> = Icon === undefined ? {} : { className: 'reverse', icon: <Icon /> } // eslint-disable-line unicorn/no-keyword-prefix

  return <Tooltip data-component="item-details-chip" title={tooltip}>
    <Chip {...attributes} color={color} label={label} onClick={onChipClick} sx={chipsStyle} variant="outlined" />
  </Tooltip>
}
