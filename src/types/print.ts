import type { AppFormData } from './events'
import type { Item, ItemField } from './item'

export interface PrintData {
  location: string
  qrCodeValue: string
  qrCodeVisual: string
  text: string
}

export type PrintFormData = AppFormData & { size: PrintFormDataSize }

export const enum PrintFormDataSize {
  rect40x20 = '40x20',
  rect40x30 = '40x30',
}

export type PrintInputData = Omit<Item, ItemField.category | ItemField.photo | ItemField.price | ItemField.referencePrinted | ItemField.status | ItemField.updatedOn>
