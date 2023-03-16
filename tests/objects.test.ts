import { expect, it } from 'vitest'
import { getObjectOrSelf, sortListsEntries } from '../src/utils/objects.utils'

it('sortListsEntries A', () => { expect(sortListsEntries({ key: ['c', 'a', 'b'] })).toEqual({ key: ['', 'a', 'b', 'c'] }) })
it('sortListsEntries B', () => { expect(sortListsEntries({ key: ['c', 'a', 'b'], key2: ['c', 'a', 'b'] })).toEqual({ key: ['', 'a', 'b', 'c'], key2: ['', 'a', 'b', 'c'] }) })
it('sortListsEntries C', () => { expect(sortListsEntries({})).toEqual({}) })
it('sortListsEntries D', () => { expect(sortListsEntries({ empty: [] })).toEqual({ empty: [''] }) })

it('getObjectOrSelf A', () => { expect(getObjectOrSelf({ keyA: 1 })).toEqual({ keyA: 1 }) })
it('getObjectOrSelf B', () => { expect(getObjectOrSelf('{"keyA":12}')).toEqual({ keyA: 12 }) })
it('getObjectOrSelf C', () => { expect(getObjectOrSelf('{"keyA":12')).toEqual({}) })
it('getObjectOrSelf D', () => { expect(getObjectOrSelf('Plop')).toEqual('Plop') })
it('getObjectOrSelf E', () => { expect(getObjectOrSelf('')).toEqual('') })
it('getObjectOrSelf F', () => { expect(getObjectOrSelf(12)).toEqual(12) })
