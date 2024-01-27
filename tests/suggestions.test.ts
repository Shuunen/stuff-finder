import { expect, it } from 'vitest'  
import { cleanSuggestions } from '../src/utils/suggestions.utils'

it('cleanSuggestions A', () => { expect(cleanSuggestions({ keyA: ['a', 'b', 'c'], keyB: ['a', 'b', 'c'] })).toEqual({ keyA: ['a', 'b', 'c'], keyB: ['a', 'b', 'c'] }) })
it('cleanSuggestions B', () => { expect(cleanSuggestions({})).toEqual({}) })
it('cleanSuggestions C', () => { expect(cleanSuggestions({ keyA: ['a', 'b', 'c'], keyB: [] })).toEqual({ keyA: ['a', 'b', 'c'] }) })
it('cleanSuggestions D', () => { expect(cleanSuggestions({ keyA: ['a', 'b', 'c'], keyB: ['a', 'b', 'c', 'a', 'b', 'c'] })).toEqual({ keyA: ['a', 'b', 'c'], keyB: ['a', 'b', 'c'] }) })
it('cleanSuggestions E', () => { expect(cleanSuggestions({ name: ['a', 'b', 'c'] })).toEqual({ name: ['A', 'B', 'C'] }) })
it('cleanSuggestions F', () => { expect(cleanSuggestions({ details: ['a', 'b', 'c'], plop: undefined })).toEqual({ details: ['A', 'B', 'C'] }) })
