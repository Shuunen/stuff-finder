import { AppBarcode } from '../components/app-barcode'
import { emptyItem } from '../constants'

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
      <div className="grid grid-cols-3 gap-6 w-3/4">
        {items.map((item) => <div className="flex flex-col items-start gap-0" key={item.reference + item.name}>
          <AppBarcode isHighlighted={isHighlighted} item={item} size={size} willResize={!item.name.includes('NOK')} />
          <p class="font-mono break-all text-xs mt-1">
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
