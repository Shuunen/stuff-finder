// oxlint-disable typescript/require-await
import { clone } from 'shuutils'
import { get } from './browser.utils'
import { mockItem } from './mock.utils'
import { state } from './state.utils'
import { addSuggestionsFromAliEx, addSuggestionsFromAngbo, addSuggestionsFromCampo, addSuggestionsFromDeyes, addSuggestionsFromWrap, cleanSuggestions, emptyItemSuggestions, getSuggestions } from './suggestions.utils'

describe('cleanSuggestions', () => {
  it('A keeps valid keys', () => {
    expect(cleanSuggestions({ keyA: ['a', 'b', 'c'], keyB: ['a', 'b', 'c'] })).toStrictEqual({
      keyA: ['a', 'b', 'c'],
      keyB: ['a', 'b', 'c'],
    })
  })
  it('B empty object', () => {
    expect(cleanSuggestions({})).toStrictEqual({})
  })
  it('C removes empty arrays', () => {
    expect(cleanSuggestions({ keyA: ['a', 'b', 'c'], keyB: [] })).toStrictEqual({ keyA: ['a', 'b', 'c'] })
  })
  it('D deduplicates and removes empty strings', () => {
    expect(cleanSuggestions({ keyA: ['a', 'b', '', '0', 'c'], keyB: ['a', 'b', 'c', 'a', 'b', 'c'] })).toStrictEqual({
      keyA: ['a', 'b', 'c'],
      keyB: ['a', 'b', 'c'],
    })
  })
  it('E filters nullish and capitalizes', () => {
    // @ts-expect-error typing is not correct
    expect(cleanSuggestions({ name: ['a', -1, '0', undefined, undefined, 'b', '', 0, 'c'] })).toStrictEqual({
      name: ['A', 'B', 'C'],
    })
  })
  it('F matches snapshot with mixed types', () => {
    // @ts-expect-error typing is not correct
    expect(cleanSuggestions({ details: ['a', 'b', 'c'], plo: ['0', 0, 12, new Date()], plop: undefined, zob: [''] })).toMatchInlineSnapshot(`
      {
        "details": [
          "A",
          "B",
          "C",
        ],
        "plo": [
          12,
        ],
        "zob": [],
      }
    `)
  })
})

describe('getSuggestions', () => {
  it('A returns status suggestion for amazon url', async () => {
    const url = 'https://www.amazon.fr/dp/B07V7GZQJ2'
    const suggestions = await getSuggestions(url)
    expect(suggestions).toMatchInlineSnapshot(`
      {
        "status": [
          "bought",
        ],
      }
    `)
  })
})

describe('addSuggestionsFromWrap', () => {
  it('A without wrapApiKey returns empty', async () => {
    state.credentials.wrap = ''
    const endpoint = 'deyes/json/0.0.2?code=3760052142741'
    const suggestions = await addSuggestionsFromWrap(endpoint)
    expect(suggestions).toMatchInlineSnapshot('{}')
  })
})

describe('addSuggestionsFromCampo', () => {
  it('A without wrapApiKey returns empty', async () => {
    state.credentials.wrap = ''
    const suggestions = clone(emptyItemSuggestions)
    await addSuggestionsFromCampo(suggestions, '3760052142741')
    expect(suggestions).toStrictEqual(emptyItemSuggestions)
  })
  it('B with working get fetches and stores suggestions', async () => {
    state.credentials.wrap = 'xyz'
    const suggestions = clone(emptyItemSuggestions)
    const mock = vi.fn<typeof get>().mockImplementation(get)
    mock.mockImplementationOnce(async () => ({ data: { items: [mockItem({ price: 42 })] }, success: true }))
    await addSuggestionsFromCampo(suggestions, '3760052142741', mock)
    expect(mock).toHaveBeenCalledExactlyOnceWith('https://wrapapi.com/use/jojo/alcampo/search/0.0.3?str=3760052142741&wrapAPIKey=xyz')
    expect(suggestions).toMatchSnapshot()
  })
})

describe('addSuggestionsFromAliEx', () => {
  it('A with working get fetches and stores suggestions', async () => {
    state.credentials.wrap = 'xyz'
    const suggestions = clone(emptyItemSuggestions)
    const title = 'title A'
    const mock = vi.fn<typeof get>().mockImplementation(get)
    mock.mockImplementationOnce(async () => ({ data: { items: [{ title }] }, success: true }))
    await addSuggestionsFromAliEx(suggestions, '3760052142741', mock)
    expect(mock).toHaveBeenCalledExactlyOnceWith('https://wrapapi.com/use/jojo/aliex/search/0.0.1?str=3760052142741&wrapAPIKey=xyz')
    expect(suggestions).toMatchSnapshot()
  })
})

describe('addSuggestionsFromAngbo', () => {
  it('A with working get fetches and stores suggestions', async () => {
    state.credentials.wrap = 'xyz'
    const suggestions = clone(emptyItemSuggestions)
    const title = 'title A'
    const mock = vi.fn<typeof get>().mockImplementation(get)
    mock.mockImplementationOnce(async () => ({ data: { title }, success: true }))
    await addSuggestionsFromAngbo(suggestions, '3760052142741', mock)
    expect(mock).toHaveBeenCalledExactlyOnceWith('https://wrapapi.com/use/jojo/angbo/search/0.0.3?id=3760052142741&wrapAPIKey=xyz')
    expect(suggestions).toMatchSnapshot()
  })
})

describe('addSuggestionsFromDeyes', () => {
  it('A with working get fetches and stores suggestions', async () => {
    state.credentials.wrap = 'xyz'
    const suggestions = clone(emptyItemSuggestions)
    const mock = vi.fn<typeof get>().mockImplementation(get)
    mock.mockImplementationOnce(async () => ({
      data: {
        brand: { name: 'brand A' },
        description: '',
        gtin13: 'gtin13omg4878',
        image: [{ image: undefined }],
        name: 'name A',
        offers: { price: '42.50' },
      },
      success: true,
    }))
    await addSuggestionsFromDeyes(suggestions, '3760052142741', mock)
    expect(mock).toHaveBeenCalledExactlyOnceWith('https://wrapapi.com/use/jojo/deyes/json/0.0.2?code=3760052142741&wrapAPIKey=xyz')
    expect(suggestions).toMatchSnapshot()
  })
})
