import { array, boolean, fallback, literal, merge, number, object, optional, safeParse, string, union, type Output } from 'valibot'

const itemStatusSchema = union([
  literal('acheté'),
  literal('à donner'),
  literal('à vendre'),
  literal('donné'),
  literal('jeté'),
  literal('renvoyé'),
  literal('vendu'),
])

type ItemStatus = Output<typeof itemStatusSchema>

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
  height: number(),
  id: idSchema,
  size: number(),
  thumbnails: object({
    full: itemThumbnailSchema,
    large: itemThumbnailSchema,
    small: itemThumbnailSchema,
  }),
  type: string(),
  url: string(),
  width: number(),
})

type ItemPhoto = Output<typeof itemPhotoSchema>

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

const itemSchema = merge([
  itemBaseSchema,
  object({
    id: idSchema,
  }),
])

type Item = Output<typeof itemSchema>
type ItemField = keyof Item

const airtableSingleRecordResponseSchema = object({
  createdTime: string(),
  error: optional(airtableErrorSchema),
  fields: itemBaseSchema,
  id: idSchema,
})

type AirtableSingleRecordResponse = Output<typeof airtableSingleRecordResponseSchema>

const airtableMultipleRecordResponseSchema = object({
  error: optional(airtableErrorSchema),
  offset: optional(string()),
  records: array(airtableSingleRecordResponseSchema),
})

type ItemSuggestions = Record<keyof Item, string[]>

const airtableDeleteRecordResponseSchema = object({
  deleted: boolean(),
  id: idSchema,
})

export function airtableSingleRecordResponseParser (data: unknown) {
  return safeParse(airtableSingleRecordResponseSchema, data)
}

export function airtableMultipleRecordResponseParser (data: unknown) {
  return safeParse(airtableMultipleRecordResponseSchema, data)
}

export function airtableDeleteRecordResponseParser (data: unknown) {
  return safeParse(airtableDeleteRecordResponseSchema, data)
}

export type { AirtableSingleRecordResponse, Item, ItemField, ItemPhoto, ItemStatus, ItemSuggestions }
