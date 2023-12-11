import { expect, it } from 'vitest' // eslint-disable-line @typescript-eslint/no-shadow
import { coolAscii } from '../src/utils/strings.utils'

it('coolAscii A', () => {
  expect(coolAscii().length > 0).toBe(true)
})
