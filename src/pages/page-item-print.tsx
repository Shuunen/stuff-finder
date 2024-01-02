import Print from '@mui/icons-material/Print'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useState } from 'preact/hooks'
import { AppBarcode } from '../components/app-barcode'
import { AppPageCard } from '../components/app-page-card'
import { printSizes, type PrintSize } from '../types/print.types'
import { itemToImageUrl, onItemImageError } from '../utils/item.utils'
import { logger } from '../utils/logger.utils'
import { itemToPrintData } from '../utils/print.utils'
import { state } from '../utils/state.utils'

// if qr code size need to be adjusted, use this old block of code :
// async function adjustQrCode () {
// // sometimes some qr code are too big and need to be resized to fit the barcode
// const preview = find.one('.app-barcode', this.previewElement)
// const margin = 5
// const maxHeight = preview.scrollHeight - margin
// await sleep(delays.medium)
// const wc = find.one<HTMLElement>('qr-code', this.previewElement)
// // reducing the module size do the trick & reduce their display size
// if (!wc.shadowRoot) { logger.showError('no shadowRoot for qr-code custom element', wc); return }
// if (!wc.shadowRoot.firstElementChild) { logger.showError('no firstElementChild for qr-code custom element shadowRoot', wc.shadowRoot); return }
// const height = wc.shadowRoot.firstElementChild.scrollHeight
// if (height <= maxHeight) { logger.info(`qr code size is ok (${height}px <= ${maxHeight}px)`); return }
// logger.info(`qr code size has been reduced, it was too big (${height}px > ${maxHeight}px)`)
// wc.setAttribute('modulesize', '2')
// }

function doPrint () {
  window.print()
}

export function PageItemPrint ({ ...properties }: { readonly [key: string]: unknown }) {

  if (typeof properties.id !== 'string') throw new Error('An id in the url is required')
  const item = state.items.find(one => one.id === properties.id)
  if (item === undefined) throw new Error('Item with id &quot;{properties.id}&quot; not found ;(')

  const { value } = itemToPrintData(item)
  const [size, setSize] = useState<PrintSize>('40x20')
  const [isHighlighted, setHighlight] = useState<boolean>(false)
  logger.debug('PageItemPrint', { item })

  function onSizeChange (_event: React.MouseEvent<HTMLElement>, selectedSize: PrintSize) { setSize(selectedSize) } // eslint-disable-line no-underscore-dangle, @typescript-eslint/naming-convention
  function onHighlightChange (_event: React.ChangeEvent<HTMLInputElement>, isChecked: boolean) { setHighlight(isChecked) } // eslint-disable-line no-underscore-dangle, @typescript-eslint/naming-convention

  return (
    <>
      <AppPageCard cardTitle="Print" icon={Print} pageCode="item-print" pageTitle={`${item.name} - Print`}>
        <div className="grid md:grid-cols-2">
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <img alt={item.name} className="h-full max-h-64 w-full object-contain pb-4 md:max-h-none md:p-12" data-id={item.id} onError={onItemImageError} src={itemToImageUrl(item)} />
          <div className="flex flex-col gap-3 text-center md:items-start md:text-left">
            <h1>{item.name}</h1>
            <p>You are about to print a barcode with the following value : {value}</p>
            <div className="flex flex-col pt-3 md:flex-row">
              <AppBarcode isHighlighted={isHighlighted} item={item} size={size} />
              <div className="flex flex-col gap-3 md:ml-6 md:items-start">
                <ToggleButtonGroup aria-label="Size" color="primary" exclusive onChange={onSizeChange} size="small" value={size}>
                  {/* @ts-expect-error issue with types */}
                  {Object.keys(printSizes).map(one => <ToggleButton key={one} value={one}>{one}</ToggleButton>)}
                </ToggleButtonGroup>
                <FormControlLabel control={<Switch checked={isHighlighted} onChange={onHighlightChange} />} label="Highlight zones" />
                <Button onClick={doPrint} variant="contained">Print</Button>
              </div>
            </div>
          </div>
        </div>
      </AppPageCard >
      <div className="hidden print:block">
        <AppBarcode item={item} size={size} />
      </div>
    </>
  )
}
