import { invariant } from 'es-toolkit'
import { settingsSchemas } from './page-settings.schemas'

describe('Page Settings', () => {
  const [settingsSchema] = settingsSchemas
  invariant(settingsSchema, 'settingsSchema is required for tests')

  it('settingsSchemas A should validate valid data', () => {
    const result = settingsSchema.safeParse({
      bucketId: 'validbucketid1234567890',
      collectionId: 'validcollectionid1234567890',
      databaseId: 'validdatabaseid1234567890',
    })
    expect(result.success).toBe(true)
  })

  it('settingsSchemas B should invalidate invalid data', () => {
    const result = settingsSchema.safeParse({
      bucketId: 'invalidbucketid',
      databaseId: 'invaliddatabaseid',
    })
    expect(result.success).toBe(false)
    expect(result.error).toMatchInlineSnapshot(`
      [ZodError: [
        {
          "origin": "string",
          "code": "invalid_format",
          "format": "regex",
          "pattern": "/^[\\\\w-]{20,100}$/u",
          "path": [
            "bucketId"
          ],
          "message": "Appwrite storage bucket id is invalid"
        },
        {
          "expected": "string",
          "code": "invalid_type",
          "path": [
            "collectionId"
          ],
          "message": "Invalid input: expected string, received undefined"
        },
        {
          "origin": "string",
          "code": "invalid_format",
          "format": "regex",
          "pattern": "/^[\\\\w-]{20,100}$/u",
          "path": [
            "databaseId"
          ],
          "message": "Appwrite database id is invalid"
        }
      ]]
    `)
  })
})
