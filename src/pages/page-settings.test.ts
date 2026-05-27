import { invariant } from 'es-toolkit'
import { safeParse } from 'valibot'
import { settingsSchemas } from './page-settings.schemas'

describe('Page Settings', () => {
  const [settingsSchema] = settingsSchemas
  invariant(settingsSchema, 'settingsSchema is required for tests')

  it('settingsSchemas A should validate valid data', () => {
    const result = safeParse(settingsSchema, {
      bucketId: 'validbucketid1234567890',
      collectionId: 'validcollectionid1234567890',
      databaseId: 'validdatabaseid1234567890',
    })
    expect(result.success).toBe(true)
  })

  it('settingsSchemas B should invalidate invalid data', () => {
    const result = safeParse(settingsSchema, {
      bucketId: 'invalidbucketid',
      databaseId: 'invaliddatabaseid',
    })
    expect(result.success).toBe(false)
    invariant(!result.success, 'result should not be successful')
    expect(result.issues.map(issue => issue.message)).toMatchInlineSnapshot(`
      [
        "Appwrite storage bucket id is invalid",
        "Invalid key: Expected "collectionId" but received undefined",
        "Appwrite database id is invalid",
      ]
    `)
  })
})
