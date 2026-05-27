import { state } from './state.utils'

describe('state', () => {
  it('A default', () => {
    expect(state).toMatchInlineSnapshot(`
      {
        "credentials": {
          "bucketId": "",
          "collectionId": "",
          "databaseId": "",
          "wrap": "",
        },
        "display": "card",
        "items": [],
        "itemsTimestamp": 0,
        "sound": "",
        "status": "loading",
        "theme": "light",
      }
    `)
  })
})
