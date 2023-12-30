import { expect, it } from 'vitest' // eslint-disable-line @typescript-eslint/no-shadow
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
      "status": "loading",
      "theme": "light",
    }
  `)
})
