import { useEffect, useRef } from 'react'
import 'webcomponent-qr-code'
import { cn } from 'shuutils'
import type { Item } from '../types/item.types'
import { type PrintSize, printSizes } from '../types/print.types'
import { logger } from '../utils/logger.utils'
import { itemToPrintData } from '../utils/print.utils'

function resizeCode(wrapper: HTMLDivElement, wc: HTMLDivElement) {
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

function getLocationClasses(length: number) {
  // oxlint-disable no-magic-numbers
  if (length === 5) return 'text-[19px] tracking-[3px]'
  if (length === 6) return 'text-[17px] tracking-[2px]'
  if (length === 7) return 'text-[16px] tracking-[1px]'
  // oxlint-enable no-magic-numbers
  return 'text-[14px] tracking-[0.5px]'
}

export function AppBarcode({ isHighlighted = false, item, size, willResize = true }: Readonly<{ isHighlighted?: boolean; item: Item; size: PrintSize; willResize?: boolean }>) {
  const { location: printLocation, text: printText, value } = itemToPrintData(item)
  logger.debug('AppBarcode', { isHighlighted, item })
  const wcReference = useRef<HTMLDivElement>(null)
  const wrapperReference = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (wrapperReference.current === null || wcReference.current === null || !willResize) return
    resizeCode(wrapperReference.current, wcReference.current)
  }, [willResize])

  return (
    <div
      className="box-content flex items-center gap-0 overflow-hidden rounded-sm border border-black px-1 transition-all print:rounded-none print:border-0 print:px-0"
      data-component="barcode"
      ref={wrapperReference}
      style={printSizes[size].styles}
    >
      <div className={`mt-1 ${isHighlighted ? 'bg-green-400' : ''}`}>
        {/* @ts-expect-error missing types */}
        <qr-code data={value} margin={0} modulesize={3} ref={wcReference} />
      </div>
      <div className="overflow-hidden pt-1 pl-1.5 text-center">
        <div className={`mb-1 line-clamp-3 font-sans text-[12px] leading-4 tracking-[-0.5px] ${isHighlighted ? 'bg-red-400' : ''}`}>{printText}</div>
        <div className={cn(`mb-1 font-mono leading-none font-bold`, isHighlighted ? 'bg-blue-400' : '', getLocationClasses(printLocation.length))}>{printLocation}</div>
      </div>
    </div>
  )
}
