import type { Models } from 'appwrite'
import type { InferOutput } from 'valibot'
import type { itemModelSchema, itemSchema } from '../utils/parsers.utils'

type ItemInfer = InferOutput<typeof itemSchema>

export type Item = {
  /**
   * @description The date when the item was created
   * @example "2025-02-09T23:51:44.371+00:00"
   */
  $createdAt: ItemInfer['$createdAt']
  /**
   * @description Unique identifier for the item
   * @example "x13-anti-spy" or "507f1f77bcf86cd799439011"
   */
  $id: ItemInfer['$id']
  /**
   * @description Barcode of the item (optional)
   * @example "1234567890123"
   */
  barcode: ItemInfer['barcode']
  /**
   * @description Storage box where the item is located
   * @example "A (apple)", "H (hardware)"
   */
  box: ItemInfer['box']
  /**
   * @description Brand or manufacturer of the item
   * @example "Apple", "Sony", "Samsung"
   */
  brand: ItemInfer['brand']
  /**
   * @description Additional details or description about the item
   * @example "MacBook Pro 16-inch, Space Gray, excellent condition"
   */
  details: ItemInfer['details']
  /**
   * @description Drawer number where the item is stored (-1 if not in a drawer)
   * @example 1, 2, 3, etc.
   */
  drawer: ItemInfer['drawer']
  /**
   * @description Whether the item sticker has been printed
   * @example true
   */
  isPrinted: ItemInfer['isPrinted']
  /**
   * @description Name of the item (required)
   * @example "MacBook Pro", "Sony WH-1000XM4"
   */
  name: ItemInfer['name']
  /**
   * @description Array of photo id for the item
   * @example ["x13-anti-spy-photo-0-webp"]
   */
  photos: ItemInfer['photos']
  /**
   * @description Price of the item (-1 if not set)
   * @example 1299, 26.99
   */
  price: ItemInfer['price']
  /**
   * @description Reference number or SKU of the item (required)
   * @example "MBP-2023-16-SG"
   */
  reference: ItemInfer['reference']
  /**
   * @description Current status of the item
   * @example "bought"
   */
  status: ItemInfer['status']
}

export type ItemSuggestions = Record<keyof Item, string[]>

export type ItemModel = InferOutput<typeof itemModelSchema> & Pick<Models.Row, '$createdAt' | '$databaseId' | '$id' | '$permissions' | '$sequence' | '$tableId' | '$updatedAt'>
