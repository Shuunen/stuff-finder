interface PrintData {
  location: string
  qrCodeValue: string
  qrCodeVisual: string
  text: string
}

type PrintFormData = { size: PrintFormDataSize } & AppFormData

type PrintFormDataSize = '40x30' | '40x20'

type PrintInputData = Omit<Item, 'category' | 'photo' | 'price' | 'ref-printed' | 'status' | 'updated-on'>
