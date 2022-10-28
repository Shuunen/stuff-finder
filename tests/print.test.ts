import { check, checksRun } from 'shuutils'
import { inputToPrintData, inputToPrintQrCodeVisual, inputToPrintText, itemToPrintLocation } from '../src/services/print.service'

const itemA = {
  name: 'name',
  brand: 'brand',
  details: 'details',
  reference: 'reference  ',
  barcode: '  barcode',
  box: ' box ',
  drawer: '2',
  location: 'location',
} as PrintOneInputData

check('itemToPrintText A', inputToPrintText(itemA), 'name brand details')
check('itemToPrintText B', inputToPrintText({ ...itemA, name: '  ' }), 'brand details')
check('itemToPrintText C', inputToPrintText({ ...itemA, brand: '  ' }), 'name details')

check('itemToPrintBarcode A', inputToPrintQrCodeVisual(itemA), '<qr-code data="reference" margin=0 modulesize=3></qr-code>')
check('itemToPrintBarcode B', inputToPrintQrCodeVisual({ ...itemA, reference: '  ', barcode: '' }), '<div class="bg-red-700 text-white">No reference or barcode</div>')
check('itemToPrintBarcode C', inputToPrintQrCodeVisual({ ...itemA, barcode: '  ', reference: '' }), '<div class="bg-red-700 text-white">No reference or barcode</div>')
check('itemToPrintBarcode D', inputToPrintQrCodeVisual({ ...itemA, reference: '' }), '<qr-code data="barcode" margin=0 modulesize=3></qr-code>')
check('itemToPrintBarcode E', inputToPrintQrCodeVisual({ ...itemA, barcode: '' }), '<qr-code data="reference" margin=0 modulesize=3></qr-code>')

check('itemToPrintLocation A', itemToPrintLocation({ box: 'A', drawer: '4' } as PrintOneInputData), 'A4')
check('itemToPrintLocation B', itemToPrintLocation({ box: 'A', drawer: '' } as PrintOneInputData), 'A')
check('itemToPrintLocation C', itemToPrintLocation({ box: '', drawer: '4' } as PrintOneInputData), '')
check('itemToPrintLocation D', itemToPrintLocation({ box: '', drawer: '' } as PrintOneInputData), '')
check('itemToPrintLocation E', itemToPrintLocation({ box: 'A', drawer: '4', location: 'Salon' } as PrintOneInputData), 'A4')
check('itemToPrintLocation F', itemToPrintLocation({ box: 'A', drawer: '', location: 'Salon' } as PrintOneInputData), 'A')
check('itemToPrintLocation G', itemToPrintLocation({ box: '', drawer: '4', location: 'Salon' } as PrintOneInputData), 'Salon')
check('itemToPrintLocation H', itemToPrintLocation(itemA), 'B2')

check('itemToPrintData A', inputToPrintData(itemA), { text: 'name brand details', qrCodeVisual: '<qr-code data="reference" margin=0 modulesize=3></qr-code>', qrCodeValue: 'reference', location: 'B2' })

checksRun()
