import { type InferOutput, array, boolean, fallback, literal, number, object, optional, string, union } from 'valibot'

const itemStatusSchema = union([
  literal('acheté'),
  literal('à donner'),
  literal('à vendre'),
  literal('donné'),
  literal('jeté'),
  literal('renvoyé'),
  literal('vendu'),
])

const airtableErrorSchema = object({
  message: string(),
  type: string(),
})

const idSchema = string()

const itemThumbnailSchema = object({
  height: number(),
  url: string(),
  width: number(),
})

const itemPhotoSchema = object({
  filename: string(),
  height: optional(number()),
  id: idSchema,
  thumbnails: optional(object({
    full: itemThumbnailSchema,
    large: itemThumbnailSchema,
    small: itemThumbnailSchema,
  })),
  type: optional(string()),
  url: string(),
  width: optional(number()),
})

const itemBaseSchema = object({
  'barcode': fallback(string(), ''),
  'box': fallback(string(), ''),
  'brand': fallback(string(), ''),
  'category': fallback(string(), ''),
  'details': fallback(string(), ''),
  'drawer': fallback(string(), ''),
  'location': fallback(string(), ''),
  'name': fallback(string(), ''),
  'photo': optional(array(itemPhotoSchema)),
  'price': optional(number()),
  'ref-printed': fallback(boolean(), false),
  'reference': fallback(string(), ''),
  'status': fallback(itemStatusSchema, 'acheté'),
  'updated-on': string(),
})

const itemSchema = object({
  ...itemBaseSchema.entries,
  id: idSchema,
})

export type ItemStatus = InferOutput<typeof itemStatusSchema>

export type ItemPhoto = InferOutput<typeof itemPhotoSchema>

export type Item = InferOutput<typeof itemSchema>

export type ItemField = keyof Item

export const airtableSingleResponseSchema = object({
  createdTime: string(),
  error: optional(airtableErrorSchema),
  fields: itemBaseSchema,
  id: idSchema,
})

export type AirtableSingleRecordResponse = InferOutput<typeof airtableSingleResponseSchema>

export const airtableMultipleResponseSchema = object({
  error: optional(airtableErrorSchema),
  offset: optional(string()),
  records: array(airtableSingleResponseSchema),
})

export type ItemSuggestions = Record<keyof Item, string[]>

export const airtableDeleteResponseSchema = object({
  deleted: boolean(),
  id: idSchema,
})
