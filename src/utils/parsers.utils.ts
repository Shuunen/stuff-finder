import { array, boolean, literal, merge, number, object, optional, parse, string, union, type Output } from 'valibot'

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
  'barcode': string(),
  'box': string(),
  'brand': string(),
  'category': string(),
  'details': string(),
  'drawer': string(),
  'location': string(),
  'name': string(),
  'photo': optional(array(itemPhotoSchema)),
  'price': optional(number()),
  'ref-printed': boolean(),
  'reference': string(),
  'status': itemStatusSchema,
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

export function airtableSingleRecordResponseParser (data: unknown) {
  return parse(airtableSingleRecordResponseSchema, data)
}

export function airtableMultipleRecordResponseParser (data: unknown) {
  return parse(airtableMultipleRecordResponseSchema, data)
}

export type { AirtableSingleRecordResponse, Item, ItemField, ItemPhoto, ItemStatus, ItemSuggestions }
