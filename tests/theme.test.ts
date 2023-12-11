import { expect, it } from 'vitest' // eslint-disable-line @typescript-eslint/no-shadow
import { theme } from '../src/utils/theme.utils'

it('theme A primary palette', () => {
  expect(theme.palette.primary).toMatchInlineSnapshot(`
    {
      "contrastText": "#fff",
      "dark": "rgb(97, 35, 153)",
      "light": "rgb(162, 91, 226)",
      "main": "#8b32db",
    }
  `)
})
