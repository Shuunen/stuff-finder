export const itemToPrintText = (item: Item): string => [item.name, item.brand, item.details].join(' ').replace(/\s{2,}/g, ' ').trim()

export const itemToPrintCode = (item: Item): string => item.reference.trim() || item.barcode.trim()

export const itemToPrintQrCodeVisual = (item: Item): string => {
  const code = itemToPrintCode(item)
  if (!code) return '<div class="bg-red-700 text-white">No reference or barcode</div>'
  return `<qr-code data="${code}" margin=0 modulesize=3></qr-code>`
}

export const itemToPrintLocation = (item: Item): string => {
  if (!item.box) return item.location ?? ''
  /* c8 ignore next */
  const box = (item.box.trim()[0] ?? '').toUpperCase()
  const drawer = (item.drawer?.[0] || '').toUpperCase()
  return `${box}${drawer}`.trim()
}

export const itemToPrintData = (item: Item): PrintData => ({
  location: itemToPrintLocation(item),
  qrCodeValue: itemToPrintCode(item),
  qrCodeVisual: itemToPrintQrCodeVisual(item),
  text: itemToPrintText(item),
})

