import { expect, it } from 'vitest'
import { coolAscii, sadAscii } from './strings.utils'

it('coolAscii A', () => {
  expect(coolAscii().length > 0).toBe(true)
})

it('sadAscii A', () => {
  expect(sadAscii().length > 0).toBe(true)
})
