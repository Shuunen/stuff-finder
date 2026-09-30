import { cn } from './class.utils'

describe('class utils', () => {
  it('cn A joins truthy class names and ignores falsy ones', () => {
    expect(cn('a', false, undefined, 'b')).toBe('a b')
  })

  it('cn B lets the last conflicting tailwind class win', () => {
    expect(cn('p-2 text-sm', 'p-4')).toBe('text-sm p-4')
  })
})
