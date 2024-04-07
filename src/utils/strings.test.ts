import { expect, it } from 'vitest'
import { coolAscii } from './strings.utils'

it('coolAscii A', () => {
  expect(coolAscii().length > 0).toBe(true)
})
