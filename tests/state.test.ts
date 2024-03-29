import { expect, it } from 'vitest'  
import { state } from '../src/utils/state.utils'

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
      "status": "loading",
      "theme": "light",
    }
  `)
})
