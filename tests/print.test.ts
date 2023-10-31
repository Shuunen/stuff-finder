import { expect, it } from 'vitest'
import type { PrintInputData } from '../src/types'
import { inputToPrintCode, inputToPrintData, inputToPrintQrCodeVisual, inputToPrintText, itemToPrintLocation } from '../src/utils/print.utils'

const itemA: PrintInputData = {
  barcode: '  barcode',
  box: ' box ',
  brand: 'brand',
  details: 'details',
  drawer: '2',
  id: '1234567',
  location: 'location',
  name: 'name',
  reference: 'reference  ',
}

const itemB: PrintInputData = {
  barcode: '  barcode',
  box: ' ',
  brand: 'brand',
  details: 'details',
  drawer: '',
  id: '1234567',
  name: 'name',
}

it('itemToPrintText A', () => { expect(inputToPrintText(itemA)).toEqual('name brand details') })
it('itemToPrintText B', () => { expect(inputToPrintText({ ...itemA, name: '  ' })).toEqual('brand details') })
it('itemToPrintText C', () => { expect(inputToPrintText({ ...itemA, brand: '  ' })).toEqual('name details') })

it('inputToPrintCode A', () => { expect(inputToPrintCode(itemA)).toEqual('reference') })
it('inputToPrintCode B', () => { expect(inputToPrintCode({ ...itemA, reference: '  ' })).toEqual('barcode') })
it('inputToPrintCode C', () => { expect(inputToPrintCode({ ...itemA, barcode: '  ', reference: '  ' })).toEqual('') })
it('inputToPrintCode D', () => { expect(inputToPrintCode(itemB)).toEqual('barcode') })
it('inputToPrintCode E', () => { expect(inputToPrintCode({})).toEqual('') })

it('itemToPrintBarcode A', () => { expect(inputToPrintQrCodeVisual(itemA)).toEqual('<qr-code data="reference" margin=0 modulesize=3></qr-code>') })
it('itemToPrintBarcode B', () => { expect(inputToPrintQrCodeVisual({ ...itemA, barcode: '', reference: '  ' })).toEqual('<div class="bg-red-700 text-white">No reference or barcode</div>') })
it('itemToPrintBarcode C', () => { expect(inputToPrintQrCodeVisual({ ...itemA, barcode: '  ', reference: '' })).toEqual('<div class="bg-red-700 text-white">No reference or barcode</div>') })
it('itemToPrintBarcode D', () => { expect(inputToPrintQrCodeVisual({ ...itemA, reference: '' })).toEqual('<qr-code data="barcode" margin=0 modulesize=3></qr-code>') })
it('itemToPrintBarcode E', () => { expect(inputToPrintQrCodeVisual({ ...itemA, barcode: '' })).toEqual('<qr-code data="reference" margin=0 modulesize=3></qr-code>') })

it('itemToPrintLocation A', () => { expect(itemToPrintLocation({ ...itemA, box: 'A', drawer: '4' })).toEqual('A4') })
it('itemToPrintLocation B', () => { expect(itemToPrintLocation({ ...itemA, box: 'A', drawer: '' })).toEqual('A') })
it('itemToPrintLocation C', () => { expect(itemToPrintLocation({ ...itemA, box: '', drawer: '4' })).toEqual('location') })
it('itemToPrintLocation D', () => { expect(itemToPrintLocation({ ...itemA, box: '', drawer: '' })).toEqual('location') })
it('itemToPrintLocation E', () => { expect(itemToPrintLocation({ ...itemA, box: 'A', drawer: '4', location: 'Salon' })).toEqual('A4') })
it('itemToPrintLocation F', () => { expect(itemToPrintLocation({ ...itemA, box: 'A', drawer: '', location: 'Salon' })).toEqual('A') })
it('itemToPrintLocation G', () => { expect(itemToPrintLocation({ ...itemA, box: '', drawer: '4', location: 'Salon' })).toEqual('Salon') })
it('itemToPrintLocation H', () => { expect(itemToPrintLocation(itemA)).toEqual('B2') })
it('itemToPrintLocation I', () => { expect(itemToPrintLocation({ ...itemA, box: '', drawer: '', location: '' })).toEqual('') })
it('itemToPrintLocation J', () => { expect(itemToPrintLocation(itemB)).toEqual('') })

it('itemToPrintData A', () => { expect(inputToPrintData(itemA)).toEqual({ location: 'B2', qrCodeValue: 'reference', qrCodeVisual: '<qr-code data="reference" margin=0 modulesize=3></qr-code>', text: 'name brand details' }) })

