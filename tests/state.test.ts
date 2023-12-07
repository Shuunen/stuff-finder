import { expect, it } from 'vitest'
import { state } from '../src/utils/state.utils'

it('state A default', () => {
  expect(state).toMatchInlineSnapshot(`
    {
      "credentials": {
        "base": "",
        "key": "",
        "table": "",
        "view": "",
        "wrap": "",
      },
      "items": [],
      "theme": "light",
    }
  `)
})
