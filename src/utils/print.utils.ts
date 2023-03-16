/* c8 ignore next */
import type { PrintInputData } from '../types'

/**
 * Generate a name from an item
 * @param input
 * @returns the generated name
 */
export function inputToPrintText (input: PrintInputData) {
  return [input.name, input.brand, input.details].join(' ').replace(/\s{2,}/gu, ' ').trim()
}

export function inputToPrintCode (input: PrintInputData) {
  const reference = input.reference?.trim() ?? ''
  if (reference.length > 0) return reference
  const barcode = input.barcode?.trim() ?? ''
  if (barcode.length > 0) return barcode
  return ''
}

export function inputToPrintQrCodeVisual (input: PrintInputData) {
  const code = inputToPrintCode(input)
  if (code === '') return '<div class="bg-red-700 text-white">No reference or barcode</div>'
  return `<qr-code data="${code}" margin=0 modulesize=3></qr-code>`
}

export function itemToPrintLocation (input: PrintInputData) {
  const box = (input.box?.trim()[0] ?? '').toUpperCase()
  if (box.length === 0) return input.location ?? ''
  const drawer = (input.drawer?.[0] ?? '').toUpperCase()
  return `${box}${drawer}`.trim()
}

export function inputToPrintData (input: PrintInputData) {
  return ({
    location: itemToPrintLocation(input),
    qrCodeValue: inputToPrintCode(input),
    qrCodeVisual: inputToPrintQrCodeVisual(input),
    text: inputToPrintText(input),
  })
}

