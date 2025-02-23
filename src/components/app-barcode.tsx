import { useSignalEffect } from '@preact/signals'
import { createRef } from 'preact'
import 'webcomponent-qr-code'
import type { Item } from '../types/item.types'
import { type PrintSize, printSizes } from '../types/print.types'
import { logger } from '../utils/logger.utils'
import { itemToPrintData } from '../utils/print.utils'

function resizeCode (wrapper: HTMLDivElement, wc: HTMLDivElement) {
  const margin = 5
  const maxHeight = wrapper.scrollHeight - margin
  const height = wc.shadowRoot?.firstElementChild?.scrollHeight
  if (height === undefined) {
    logger.showError('failed to get qr code height')
    return
  }
  if (height <= maxHeight) return
  logger.info('resizing down qr code', wc)
  wc.setAttribute('modulesize', '2')
}

export function AppBarcode ({ isHighlighted = false, item, size, willResize = true }: Readonly<{ isHighlighted?: boolean; item: Item; size: PrintSize, willResize?: boolean }>) {
  const { location: printLocation, text: printText, value } = itemToPrintData(item)
  logger.debug('AppBarcode', { isHighlighted, item })
  const wcReference = createRef<HTMLDivElement>()
  const wrapperReference = createRef<HTMLDivElement>()

  useSignalEffect(() => {
    if (wrapperReference.current === null || wcReference.current === null || !willResize) return
    resizeCode(wrapperReference.current, wcReference.current)
  })

  return (
    <div class="box-content flex items-center gap-0 overflow-hidden rounded border border-black px-1 transition-all print:rounded-none print:border-0 print:px-0" data-component="barcode" ref={wrapperReference} style={printSizes[size].styles}>
      <div class={`mt-1 ${isHighlighted ? 'bg-green-400' : ''}`}>{/* @ts-expect-error missing types */}
        <qr-code data={value} margin={0} modulesize={3} ref={wcReference} />
      </div>
      <div class="overflow-hidden pl-1.5 pt-1 text-center">
        <div class={`mb-1 line-clamp-3 font-sans text-[12px] leading-4 tracking-[-0.5px] ${isHighlighted ? 'bg-red-400' : ''}`} >{printText}</div>
        <div class={`mb-1 font-mono text-[19px] font-bold leading-none tracking-[2px] ${isHighlighted ? 'bg-blue-400' : ''}`}>{printLocation}</div>
      </div>
    </div>
  )
}
