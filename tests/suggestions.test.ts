/* eslint-disable @typescript-eslint/naming-convention */
import { clone } from 'shuutils'
import { expect, it, vi } from 'vitest'
import { emptyItemSuggestions } from '../src/constants'
import { get } from '../src/utils/browser.utils'
import { mockItem } from '../src/utils/mock.utils'
import { state } from '../src/utils/state.utils'
import { addSuggestionsFromAliEx, addSuggestionsFromAngbo, addSuggestionsFromCampo, addSuggestionsFromDeyes, addSuggestionsFromWrap, cleanSuggestions, getSuggestions } from '../src/utils/suggestions.utils'


it('cleanSuggestions A', () => { expect(cleanSuggestions({ keyA: ['a', 'b', 'c'], keyB: ['a', 'b', 'c'] })).toEqual({ keyA: ['a', 'b', 'c'], keyB: ['a', 'b', 'c'] }) })
it('cleanSuggestions B', () => { expect(cleanSuggestions({})).toEqual({}) })
it('cleanSuggestions C', () => { expect(cleanSuggestions({ keyA: ['a', 'b', 'c'], keyB: [] })).toEqual({ keyA: ['a', 'b', 'c'] }) })
it('cleanSuggestions D', () => { expect(cleanSuggestions({ keyA: ['a', 'b', 'c'], keyB: ['a', 'b', 'c', 'a', 'b', 'c'] })).toEqual({ keyA: ['a', 'b', 'c'], keyB: ['a', 'b', 'c'] }) })
it('cleanSuggestions E', () => { expect(cleanSuggestions({ name: ['a', 'b', '', 'c'] })).toEqual({ name: ['A', 'B', 'C'] }) })
it('cleanSuggestions F', () => { expect(cleanSuggestions({ details: ['a', 'b', 'c'], plop: undefined })).toEqual({ details: ['A', 'B', 'C'] }) })

it('getSuggestions A', async () => {
  const url = 'https://www.amazon.fr/dp/B07V7GZQJ2'
  const suggestions = await getSuggestions(url)
  expect(suggestions).toMatchInlineSnapshot(`
    {
      "status": [
        "acheté",
      ],
    }
  `)
})

it('addSuggestionsFromWrap A without wrapApiKey', async () => {
  state.credentials.wrap = ''
  const endpoint = 'deyes/json/0.0.2?code=3760052142741'
  const suggestions = await addSuggestionsFromWrap(endpoint)
  expect(suggestions).toMatchInlineSnapshot('{}')
})

it('addSuggestionsFromWrap B with wrapApiKey', async () => {
  state.credentials.wrap = 'xyz'
  const endpoint = 'deyes/json/0.0.2?code=3760052142741'
  const suggestions = await addSuggestionsFromWrap(endpoint)
  expect(suggestions).toMatchSnapshot()
})

it('addSuggestionsFromCampo A without wrapApiKey', async () => {
  state.credentials.wrap = ''
  const suggestions = clone(emptyItemSuggestions)
  await addSuggestionsFromCampo(suggestions, '3760052142741')
  expect(suggestions).toStrictEqual(emptyItemSuggestions)
})

it('addSuggestionsFromCampo B with working get', async () => {
  state.credentials.wrap = 'xyz'
  const suggestions = clone(emptyItemSuggestions)
  const mock = vi.fn().mockImplementation(get)
  mock.mockImplementationOnce(() => ({ data: { items: [mockItem({ price: 42 })] }, success: true }))
  await addSuggestionsFromCampo(suggestions, '3760052142741', mock)
  expect(mock).toHaveBeenCalledTimes(1)
  expect(mock).toHaveBeenCalledWith('https://wrapapi.com/use/jojo/alcampo/search/0.0.3?str=3760052142741&wrapAPIKey=xyz')
  expect(suggestions).toMatchSnapshot()
})

it('addSuggestionsFromAliEx A with working get', async () => {
  state.credentials.wrap = 'xyz'
  const suggestions = clone(emptyItemSuggestions)
  const title = 'title A'
  const mock = vi.fn().mockImplementation(get)
  mock.mockImplementationOnce(() => ({ data: { items: [{ title }] }, success: true }))
  await addSuggestionsFromAliEx(suggestions, '3760052142741', mock)
  expect(mock).toHaveBeenCalledTimes(1)
  expect(mock).toHaveBeenCalledWith('https://wrapapi.com/use/jojo/aliex/search/0.0.1?str=3760052142741&wrapAPIKey=xyz')
  expect(suggestions).toMatchSnapshot()
})

it('addSuggestionsFromAngbo A with working get', async () => {
  state.credentials.wrap = 'xyz'
  const suggestions = clone(emptyItemSuggestions)
  const title = 'title A'
  const mock = vi.fn().mockImplementation(get)
  mock.mockImplementationOnce(() => ({ data: { title }, success: true }))
  await addSuggestionsFromAngbo(suggestions, '3760052142741', mock)
  expect(mock).toHaveBeenCalledTimes(1)
  expect(mock).toHaveBeenCalledWith('https://wrapapi.com/use/jojo/angbo/search/0.0.3?id=3760052142741&wrapAPIKey=xyz')
  expect(suggestions).toMatchSnapshot()
})

it('addSuggestionsFromDeyes A with working get', async () => {
  state.credentials.wrap = 'xyz'
  const suggestions = clone(emptyItemSuggestions)
  const mock = vi.fn().mockImplementation(get)
  mock.mockImplementationOnce(() => ({ data: { brand: { name: 'brand A' }, description: '', gtin13: 'gtin13azdaz4878', image: [{ image: undefined }], name: 'name A', offers: { price: '42.50' } }, success: true }))
  await addSuggestionsFromDeyes(suggestions, '3760052142741', mock)
  expect(mock).toHaveBeenCalledTimes(1)
  expect(mock).toHaveBeenCalledWith('https://wrapapi.com/use/jojo/deyes/json/0.0.2?code=3760052142741&wrapAPIKey=xyz')
  expect(suggestions).toMatchSnapshot()
})
