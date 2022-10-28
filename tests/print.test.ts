import { check, checksRun } from 'shuutils'
import { itemToPrintData, itemToPrintLocation, itemToPrintQrCodeVisual, itemToPrintText } from '../src/services/print.service'

const itemA = {
  name: 'name',
  brand: 'brand',
  details: 'details',
  reference: 'reference  ',
  barcode: '  barcode',
  box: ' box ',
  drawer: '2',
  location: 'location',
} as Item

check('itemToPrintText A', itemToPrintText(itemA), 'name brand details')
check('itemToPrintText B', itemToPrintText({ ...itemA, name: '  ' }), 'brand details')
check('itemToPrintText C', itemToPrintText({ ...itemA, brand: '  ' }), 'name details')

check('itemToPrintBarcode A', itemToPrintQrCodeVisual(itemA), '<qr-code data="reference" margin=0 modulesize=3></qr-code>')
check('itemToPrintBarcode B', itemToPrintQrCodeVisual({ ...itemA, reference: '  ', barcode: '' }), '<div class="bg-red-700 text-white">No reference or barcode</div>')
check('itemToPrintBarcode C', itemToPrintQrCodeVisual({ ...itemA, barcode: '  ', reference: '' }), '<div class="bg-red-700 text-white">No reference or barcode</div>')
check('itemToPrintBarcode D', itemToPrintQrCodeVisual({ ...itemA, reference: '' }), '<qr-code data="barcode" margin=0 modulesize=3></qr-code>')
check('itemToPrintBarcode E', itemToPrintQrCodeVisual({ ...itemA, barcode: '' }), '<qr-code data="reference" margin=0 modulesize=3></qr-code>')

check('itemToPrintLocation A', itemToPrintLocation({ box: 'A', drawer: '4' } as Item), 'A4')
check('itemToPrintLocation B', itemToPrintLocation({ box: 'A', drawer: '' } as Item), 'A')
check('itemToPrintLocation C', itemToPrintLocation({ box: '', drawer: '4' } as Item), '')
check('itemToPrintLocation D', itemToPrintLocation({ box: '', drawer: '' } as Item), '')
check('itemToPrintLocation E', itemToPrintLocation({ box: 'A', drawer: '4', location: 'Salon' } as Item), 'A4')
check('itemToPrintLocation F', itemToPrintLocation({ box: 'A', drawer: '', location: 'Salon' } as Item), 'A')
check('itemToPrintLocation G', itemToPrintLocation({ box: '', drawer: '4', location: 'Salon' } as Item), 'Salon')
check('itemToPrintLocation H', itemToPrintLocation(itemA), 'B2')

check('itemToPrintData A', itemToPrintData(itemA), { text: 'name brand details', qrCodeVisual: '<qr-code data="reference" margin=0 modulesize=3></qr-code>', qrCodeValue: 'reference', location: 'B2' })

checksRun()
