import { z } from 'zod'

const appwriteIdPattern = /^[\w-]{20,100}$/u

export const settingsSchema = z.object({
  bucketId: z.string().regex(appwriteIdPattern, 'Appwrite storage bucket id is invalid'),
  collectionId: z.string().regex(appwriteIdPattern, 'Appwrite collection id is invalid'),
  databaseId: z.string().regex(appwriteIdPattern, 'Appwrite database id is invalid'),
})

export const settingsSchemas = [settingsSchema]

export type SettingsFormData = z.infer<typeof settingsSchema>
