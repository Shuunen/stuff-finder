import type { AppFormData } from './events.types'
import type { Item } from './item.types'

export interface PrintData {
  location: string
  qrCodeValue: string
  qrCodeVisual: string
  text: string
}

export const enum PrintFormDataSize {
  Rect40x20 = '40x20',
  Rect40x30 = '40x30',
}

export type PrintFormData = AppFormData & { size: PrintFormDataSize }

export type PrintInputData = Partial<Item>
