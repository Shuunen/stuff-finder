import { coolAscii, sadAscii } from './strings.utils'

describe('strings.utils', () => {
  it('coolAscii A', () => {
    expect(coolAscii().length).toBeGreaterThan(0)
  })

  it('sadAscii A', () => {
    expect(sadAscii().length).toBeGreaterThan(0)
  })
})
