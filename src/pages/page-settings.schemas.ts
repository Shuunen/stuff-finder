import { type InferOutput, object, pipe, regex, string } from 'valibot'

const appwriteIdPattern = /^[\w-]{20,100}$/u

export const settingsSchema = object({
  bucketId: pipe(string(), regex(appwriteIdPattern, 'Appwrite storage bucket id is invalid')),
  collectionId: pipe(string(), regex(appwriteIdPattern, 'Appwrite collection id is invalid')),
  databaseId: pipe(string(), regex(appwriteIdPattern, 'Appwrite database id is invalid')),
})

export const settingsSchemas = [settingsSchema]

export type SettingsFormData = InferOutput<typeof settingsSchema>
