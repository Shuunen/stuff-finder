import { check, checksRun } from 'shuutils'
import { inputToPrintCode, inputToPrintData, inputToPrintQrCodeVisual, inputToPrintText, itemToPrintLocation } from '../src/services/print.service'
import type { PrintInputData } from '../src/types'

const itemA: PrintInputData = {
  id: '1234567',
  name: 'name',
  brand: 'brand',
  details: 'details',
  reference: 'reference  ',
  barcode: '  barcode',
  box: ' box ',
  drawer: '2',
  location: 'location',
}

const itemB: PrintInputData = {
  id: '1234567',
  name: 'name',
  brand: 'brand',
  details: 'details',
  barcode: '  barcode',
  box: ' ',
  drawer: '',
}

check('itemToPrintText A', inputToPrintText(itemA), 'name brand details')
check('itemToPrintText B', inputToPrintText({ ...itemA, name: '  ' }), 'brand details')
check('itemToPrintText C', inputToPrintText({ ...itemA, brand: '  ' }), 'name details')

check('inputToPrintCode A', inputToPrintCode(itemA), 'reference')
check('inputToPrintCode B', inputToPrintCode({ ...itemA, reference: '  ' }), 'barcode')
check('inputToPrintCode C', inputToPrintCode({ ...itemA, reference: '  ', barcode: '  ' }), '')
check('inputToPrintCode D', inputToPrintCode(itemB), 'barcode')
check('inputToPrintCode E', inputToPrintCode({}), '')

check('itemToPrintBarcode A', inputToPrintQrCodeVisual(itemA), '<qr-code data="reference" margin=0 modulesize=3></qr-code>')
check('itemToPrintBarcode B', inputToPrintQrCodeVisual({ ...itemA, reference: '  ', barcode: '' }), '<div class="bg-red-700 text-white">No reference or barcode</div>')
check('itemToPrintBarcode C', inputToPrintQrCodeVisual({ ...itemA, barcode: '  ', reference: '' }), '<div class="bg-red-700 text-white">No reference or barcode</div>')
check('itemToPrintBarcode D', inputToPrintQrCodeVisual({ ...itemA, reference: '' }), '<qr-code data="barcode" margin=0 modulesize=3></qr-code>')
check('itemToPrintBarcode E', inputToPrintQrCodeVisual({ ...itemA, barcode: '' }), '<qr-code data="reference" margin=0 modulesize=3></qr-code>')

check('itemToPrintLocation A', itemToPrintLocation({ ...itemA, box: 'A', drawer: '4' }), 'A4')
check('itemToPrintLocation B', itemToPrintLocation({ ...itemA, box: 'A', drawer: '' }), 'A')
check('itemToPrintLocation C', itemToPrintLocation({ ...itemA, box: '', drawer: '4' }), 'location')
check('itemToPrintLocation D', itemToPrintLocation({ ...itemA, box: '', drawer: '' }), 'location')
check('itemToPrintLocation E', itemToPrintLocation({ ...itemA, box: 'A', drawer: '4', location: 'Salon' }), 'A4')
check('itemToPrintLocation F', itemToPrintLocation({ ...itemA, box: 'A', drawer: '', location: 'Salon' }), 'A')
check('itemToPrintLocation G', itemToPrintLocation({ ...itemA, box: '', drawer: '4', location: 'Salon' }), 'Salon')
check('itemToPrintLocation H', itemToPrintLocation(itemA), 'B2')
check('itemToPrintLocation I', itemToPrintLocation({ ...itemA, box: '', drawer: '', location: '' }), '')
check('itemToPrintLocation J', itemToPrintLocation(itemB), '')

check('itemToPrintData A', inputToPrintData(itemA), { text: 'name brand details', qrCodeVisual: '<qr-code data="reference" margin=0 modulesize=3></qr-code>', qrCodeValue: 'reference', location: 'B2' })

checksRun()
