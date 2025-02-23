import type { Models } from 'appwrite'
import type { InferOutput } from 'valibot'
import type { itemModelSchema, itemSchema } from '../utils/parsers.utils'

export type Item = InferOutput<typeof itemSchema>

export type ItemSuggestions = Record<keyof Item, string[]>

export type ItemModel = InferOutput<typeof itemModelSchema> & Pick<Models.Document, '$collectionId' | '$createdAt' | '$databaseId' | '$id' | '$permissions' | '$updatedAt'>
