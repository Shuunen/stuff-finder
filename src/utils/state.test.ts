import { expect, it } from 'vitest'
import { state } from './state.utils'

it('state A default', () => {
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
      "lists": {
        "boxes": [
          "",
          "A (apple)",
          "B (usb & audio)",
          "C (couteau)",
          "D (doll)",
          "E (east)",
          "F (périphériques)",
          "G (brico & sport)",
          "H (hardware)",
          "L (lemon)",
          "M (malettes)",
          "N (noodles)",
          "O (orange)",
          "P (plan de travail)",
          "Q (sock)",
          "R (récup)",
          "R (red)",
          "S (sdb)",
          "T (tour bureau)",
          "V (violet)",
          "X (commode malm)",
          "Z (poches zip)",
        ],
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
        "statuses": [
          "bought",
          "for-sell",
          "lost",
          "to-give",
        ],
      },
      "sound": "",
      "status": "loading",
      "theme": "light",
    }
  `)
})
