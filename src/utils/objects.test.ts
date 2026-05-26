import { sortListsEntries } from './objects.utils'

describe('objects.utils', () => {
  it('sortListsEntries A', () => {
    expect(sortListsEntries({ key: ['c', 'a', 'b'] })).toStrictEqual({ key: ['', 'a', 'b', 'c'] })
  })
  it('sortListsEntries B', () => {
    expect(sortListsEntries({ key: ['c', 'a', 'b'], key2: ['c', 'a', 'b'] })).toStrictEqual({ key: ['', 'a', 'b', 'c'], key2: ['', 'a', 'b', 'c'] })
  })
  it('sortListsEntries C', () => {
    expect(sortListsEntries({})).toStrictEqual({})
  })
  it('sortListsEntries D', () => {
    expect(sortListsEntries({ empty: [] })).toStrictEqual({ empty: [''] })
  })
})
