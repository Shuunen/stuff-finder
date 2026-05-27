import { AppBarcode } from '../components/app-barcode'
import type { Item } from '../types/item.types'
import { emptyItem } from '../utils/item.utils'

const isHighlighted = false
const size = '40x20'
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
  {
    ...emptyItem,
    box: 'Red' as Item['box'],
    brand: '3 chars box name',
    drawer: 3,
    name: 'This is a box test',
    reference: '12345678901234567890wq',
  },
  {
    ...emptyItem,
    box: 'Blue',
    brand: '4 chars box name',
    drawer: 4,
    name: 'This is a box test',
    reference: '12345678901234567890wq',
  },
  {
    ...emptyItem,
    box: 'Green',
    brand: '5 chars box name',
    drawer: 5,
    name: 'This is a box test',
    reference: '12345678901234567890wq',
  },
  {
    ...emptyItem,
    box: 'Yellow',
    brand: '6 chars box name',
    drawer: 6,
    name: 'This is a box test',
    reference: '12345678901234567890wq',
  },
] satisfies Item[]

export function PageKitchenSink() {
  return (
    <div className="flex flex-col">
      <h1>Kitchen Sink</h1>
      <h2>Barcodes</h2>
      <div className="grid w-3/4 grid-cols-3 gap-6">
        {items.map(item => (
          <div className="flex flex-col items-start gap-0" key={item.reference + item.name}>
            <AppBarcode isHighlighted={isHighlighted} item={item} size={size} willResize={!item.name.includes('NOK')} />
            <p className="mt-1 font-mono text-xs break-all">
              reference : {item.reference}
              <br />
              length : {item.reference.length}
              <br />
              {/* oxlint-disable-next-line no-magic-numbers */}
              size : {item.name.includes('resized') ? 2 : 3}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
