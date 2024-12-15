import { expect, it } from 'vitest'
import { state } from './state.utils'

it('state A default', () => {
  expect(state).toMatchInlineSnapshot(`
    {
      "credentials": {
        "base": "",
        "table": "",
        "token": "",
        "view": "",
        "wrap": "",
      },
      "display": "list",
      "items": [],
      "lists": {
        "boxes": [],
        "categories": [],
        "drawers": [
          "",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
        ],
        "locations": [],
        "statuses": [
          "acheté",
          "à donner",
          "à vendre",
          "donné",
          "jeté",
          "renvoyé",
          "vendu",
        ],
      },
      "message": undefined,
      "sound": "",
      "status": "loading",
      "theme": "light",
    }
  `)
})
