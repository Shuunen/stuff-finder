import { AppBarcode } from '../components/app-barcode'
import { emptyItem } from '../utils/item.utils'

const isHighlighted = false
const size = "40x20"
const items = [
  { ...emptyItem, name: 'ok without resize', reference: '123' },
  { ...emptyItem, name: 'ok without resize', reference: '123456' },
  { ...emptyItem, name: 'ok without resize', reference: '123456789012' },
  { ...emptyItem, name: 'ok without resize', reference: '12345678901234567890' },
  { ...emptyItem, name: 'NOK without resize', reference: '12345678901234567890!' },
  { ...emptyItem, name: 'ok resized to 2', reference: '12345678901234567890!' },
  { ...emptyItem, name: 'ok without resize', reference: 'le chat de feu' },
  { ...emptyItem, name: 'NOK without resize', reference: 'le chat de feu vert' },
  { ...emptyItem, name: 'ok resized to 2', reference: 'le chat de feu vert' },
]

export function PageKitchenSink () {
  return (
    <div class="flex flex-col">
      <h1>Kitchen Sink</h1>
      <h2>Barcodes</h2>
      <div class="grid w-3/4 grid-cols-3 gap-6">
        {items.map((item) => <div class="flex flex-col items-start gap-0" key={item.reference + item.name}>
          <AppBarcode isHighlighted={isHighlighted} item={item} size={size} willResize={!item.name.includes('NOK')} />
          <p class="mt-1 break-all font-mono text-xs">
            reference : {item.reference}<br />
            length : {item.reference.length}<br />
            size : {item.name.includes('resized') ? 2 : 3 /* eslint-disable-line @typescript-eslint/no-magic-numbers */}
          </p>
        </div>,
        )}
      </div>
    </div>
  )
}
