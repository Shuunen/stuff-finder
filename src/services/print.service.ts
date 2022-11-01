/* c8 ignore next */

/**
 * Generate a name from an item
 * @param input
 * @returns {string} the generated name
 */
export const inputToPrintText = (input: PrintInputData): string => [input.name, input.brand, input.details].join(' ').replace(/\s{2,}/g, ' ').trim()

export const inputToPrintCode = (input: PrintInputData): string => input.reference.trim() || input.barcode.trim()

export const inputToPrintQrCodeVisual = (input: PrintInputData): string => {
  const code = inputToPrintCode(input)
  if (!code) return '<div class="bg-red-700 text-white">No reference or barcode</div>'
  return `<qr-code data="${code}" margin=0 modulesize=3></qr-code>`
}

export const itemToPrintLocation = (input: PrintInputData): string => {
  const box = (input.box.trim()[0] ?? '').toUpperCase()
  if (box.length === 0) return input.location
  const drawer = (input.drawer[0] ?? '').toUpperCase()
  return `${box}${drawer}`.trim()
}

export const inputToPrintData = (input: PrintInputData): PrintData => ({
  location: itemToPrintLocation(input),
  qrCodeValue: inputToPrintCode(input),
  qrCodeVisual: inputToPrintQrCodeVisual(input),
  text: inputToPrintText(input),
})

