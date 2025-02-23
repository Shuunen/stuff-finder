import Chip, { type ChipOwnProps } from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import { route } from 'preact-router'
import { useCallback } from 'preact/hooks'
import { copyToClipboard } from 'shuutils'
import type { MuiIcon } from '../types/icons.types'
import { logger } from '../utils/logger.utils'

type Properties = Readonly<{
  color?: ChipOwnProps['color']
  icon?: MuiIcon | undefined
  label: string
  link?: string
  tooltip: string
}>

const chipsStyle = { height: 28, paddingTop: 0.3 }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function AppItemDetailsChip ({ color = 'default', icon: Icon, label, link, tooltip }: Properties) {

  const onChipClick = useCallback(async (event: MouseEvent) => {
    event.stopPropagation()
    logger.debug('onChipClick', { event })
    if (link !== undefined) { route(link); return }
    const target = event.currentTarget as HTMLElement // eslint-disable-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion
    await copyToClipboard(target.textContent ?? '')
    logger.showSuccess(`${tooltip.split(',')[0]} copied to clipboard`)
  }, [link, tooltip])

  const attributes: Record<string, unknown> = Icon === undefined ? {} : { className: 'reverse', icon: <Icon sx={{ marginRight: '5px !important', marginLeft: '-7px !important' }} /> } // eslint-disable-line unicorn/no-keyword-prefix

  return <Tooltip data-component="item-details-chip" title={tooltip}>
    <Chip {...attributes} color={color} label={label} onClick={onChipClick} sx={chipsStyle} variant="outlined" />
  </Tooltip>
}
