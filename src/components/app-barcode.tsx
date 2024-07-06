
import 'webcomponent-qr-code'
import { type PrintSize, printSizes } from '../types/print.types'
import { logger } from '../utils/logger.utils'
import type { Item } from '../utils/parsers.utils'
import { itemToPrintData } from '../utils/print.utils'

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
export function AppBarcode ({ isHighlighted = false, item, size }: Readonly<{ isHighlighted?: boolean; item: Item; size: PrintSize }>) {

  const { location: printLocation, text: printText, value } = itemToPrintData(item)
  logger.debug('AppBarcode', { isHighlighted, item })

  return (
    <div className="box-content flex items-center gap-0 overflow-hidden rounded border border-black px-1 transition-all print:rounded-none print:border-0 print:px-0" data-component="barcode" style={printSizes[size].styles}>
      <div className={`mt-1 ${isHighlighted ? 'bg-green-400' : ''}`}>
        {/* @ts-expect-error missing types */}
        <qr-code data={value} margin={0} modulesize={3} />
      </div>
      <div className="overflow-hidden pl-1.5 pt-1 text-center">
        <div className={`mb-1 line-clamp-3 font-sans text-[12px] leading-4 tracking-[-0.5px] ${isHighlighted ? 'bg-red-400' : ''}`} >{printText}</div>
        <div className={`mb-1 font-mono text-[19px] font-bold leading-none tracking-[2px] ${isHighlighted ? 'bg-blue-400' : ''}`}>{printLocation}</div>
      </div>
    </div>
  )
}
