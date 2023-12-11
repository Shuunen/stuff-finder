import { expect, it } from 'vitest' // eslint-disable-line @typescript-eslint/no-shadow
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
