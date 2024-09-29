import Print from '@mui/icons-material/Print'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useSignalEffect } from '@preact/signals'
import { useCallback, useMemo, useState } from 'preact/hooks'
import { sleep } from 'shuutils'
import { AppBarcode } from '../components/app-barcode'
import { AppPageCard } from '../components/app-page-card'
import { delays } from '../constants'
import { type PrintSize, printSizes } from '../types/print.types'
import { clearElementsForPrint } from '../utils/browser.utils'
import { itemToImageUrl, onItemImageError, pushItem } from '../utils/item.utils'
import { logger } from '../utils/logger.utils'
import { itemToPrintData } from '../utils/print.utils'
import { state } from '../utils/state.utils'

// eslint-disable-next-line max-statements, max-lines-per-function
export function PageItemPrint ({ ...properties }: Readonly<Record<string, unknown>>) {
  if (typeof properties.id !== 'string') throw new Error('An id in the url is required')
  const item = state.items.find(one => one.id === properties.id)
  if (item === undefined) throw new Error('Item with id &quot;{properties.id}&quot; not found ;(')

  const { value } = itemToPrintData(item)
  const [size, setSize] = useState<PrintSize>('40x20')
  const [isPrintMode, setIsPrintMode] = useState<boolean>(false)
  const [isHighlighted, setIsHighlighted] = useState<boolean>(false)
  logger.debug('PageItemPrint', { item })
  const onSizeChange = useCallback((_event: unknown, selectedSize: PrintSize) => { setSize(selectedSize) }, []) // eslint-disable-line @typescript-eslint/naming-convention
  const onHighlightChange = useCallback((_event: unknown, isChecked: boolean) => { setIsHighlighted(isChecked) }, []) // eslint-disable-line @typescript-eslint/naming-convention
  const highlightSwitch = useMemo(() => <Switch checked={isHighlighted} onChange={onHighlightChange} />, [isHighlighted, onHighlightChange])
  const onPrint = useCallback(async () => {
    clearElementsForPrint()
    setIsPrintMode(true)
    await sleep(delays.medium)
    window.print()
    setIsPrintMode(false)
    if (item['ref-printed']) return
    item['ref-printed'] = true
    const result = await pushItem(item)
    state.message = { content: `${result.success ? 'updated' : 'failed updating'} item as printed`, delay: delays.seconds, type: result.success ? 'success' : 'error' }
    if (!result.success) logger.error('pushItem failed', result)
  }, [item])
  // trigger print directly on page load
  useSignalEffect(() => { void sleep(delays.medium).then(async () => onPrint()) })

  return (
    <>
      <AppPageCard cardTitle="Print" icon={Print} pageCode="item-print" pageTitle={`${item.name} - Print`}>
        <div class="flex flex-col md:flex-row">
          <img alt={item.name} class="mx-auto max-h-64 object-contain" data-id={item.id} onError={onItemImageError} src={itemToImageUrl(item)} />
          <div class="flex flex-col gap-3 text-center md:items-start md:text-left">
            <h1 class="w-full">{item.name}</h1>
            <p>You are about to print a barcode with the following value : {value}</p>
            <div class="flex flex-col pt-3 md:flex-row">
              <AppBarcode isHighlighted={isHighlighted} item={item} size={size} />
              <div class="flex flex-col gap-3 md:ml-6 md:items-start">
                <ToggleButtonGroup aria-label="Size" color="primary" exclusive onChange={onSizeChange} size="small" value={size}>
                  {Object.keys(printSizes).map(one => <ToggleButton key={one} value={one}>{one}</ToggleButton>)}
                </ToggleButtonGroup>
                <FormControlLabel control={highlightSwitch} label="Highlight zones" />
                <Button onClick={onPrint} variant="contained">Print</Button>
              </div>
            </div>
          </div>
        </div>
      </AppPageCard >
      {isPrintMode && <AppBarcode item={item} size={size} />}
    </>
  )
}
