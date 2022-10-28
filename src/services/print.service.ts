const itemToText = (item: Item): string => [item.name, item.brand, item.details].join(' ').trim()

const itemToBarcode = (_item: Item): string => '||||  ||  ||||'

const itemToLocation = (item: Item): string => {
  if (!item.box) return item.location
  return `${item.box[0]}${item.drawer?.[0] || ''} ( ${item.location} )`
}

const getData = (item: Item): PrintData => ({
  text: itemToText(item),
  barcode: itemToBarcode(item),
  location: itemToLocation(item),
})

export const printService = {
  getData,
}
