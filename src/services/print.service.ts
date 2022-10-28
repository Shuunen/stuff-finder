export const inputToPrintText = (input: PrintOneInputData): string => [input.name, input.brand, input.details].join(' ').replace(/\s{2,}/g, ' ').trim()

export const inputToPrintCode = (input: PrintOneInputData): string => input.reference.trim() || input.barcode.trim()

export const inputToPrintQrCodeVisual = (input: PrintOneInputData): string => {
  const code = inputToPrintCode(input)
  if (!code) return '<div class="bg-red-700 text-white">No reference or barcode</div>'
  return `<qr-code data="${code}" margin=0 modulesize=3></qr-code>`
}

export const itemToPrintLocation = (input: PrintOneInputData): string => {
  if (!input.box) return input.location ?? ''
  /* c8 ignore next */
  const box = (input.box.trim()[0] ?? '').toUpperCase()
  const drawer = (input.drawer?.[0] || '').toUpperCase()
  return `${box}${drawer}`.trim()
}

export const inputToPrintData = (input: PrintOneInputData): PrintData => ({
  location: itemToPrintLocation(input),
  qrCodeValue: inputToPrintCode(input),
  qrCodeVisual: inputToPrintQrCodeVisual(input),
  text: inputToPrintText(input),
})

