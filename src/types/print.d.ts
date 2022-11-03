interface PrintData {
  location: string
  qrCodeValue: string
  qrCodeVisual: string
  text: string
}

type PrintFormData = AppFormData & { size: PrintFormDataSize }

const enum PrintFormDataSize {
  rect40x20 = '40x20',
  rect40x30 = '40x30',
}

type PrintInputData = Omit<Item, ItemField.category | ItemField.photo | ItemField.price | ItemField.referencePrinted | ItemField.status | ItemField.updatedOn>
