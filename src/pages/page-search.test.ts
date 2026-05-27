import { mockItem } from '../utils/mock.utils'
import { navigate } from '../utils/navigation.utils'
import { state } from '../utils/state.utils'
import { navigateToSearch, search } from './page-search.const'

// Mock navigation utils
vi.mock(import('../utils/navigation.utils'), () => ({
  navigate: vi.fn<() => void>(),
}))

// Mock fuse.js/basic
// oxlint-disable-next-line vitest/prefer-import-in-mock
vi.mock('fuse.js/basic', () => {
  class MockFuse {
    public items: unknown[]
    public constructor(items: unknown[]) {
      this.items = items
    }
    public search() {
      void this.items
      return [{ item: { $id: '1', name: 'Test Item 1' } }, { item: { $id: '2', name: 'Test Item 2' } }]
    }
  }
  return { default: MockFuse }
})

describe('page-search.const', () => {
  const mockItems = [
    mockItem({
      $id: '1',
      barcode: 'BAR123',
      reference: 'REF123',
    }),
    mockItem({
      $id: '2',
      barcode: 'BAR456',
      reference: 'REF456',
    }),
  ]

  beforeEach(() => {
    state.items = mockItems
    vi.clearAllMocks()
  })

  it('search A should return search results when no exact match found', async () => {
    const result = await search('test query')

    expect(result).toMatchInlineSnapshot(`
      {
        "header": "2 results found for "test query"",
        "results": [
          {
            "$id": "1",
            "name": "Test Item 1",
          },
          {
            "$id": "2",
            "name": "Test Item 2",
          },
        ],
      }
    `)
  })

  it('navigateToSearch A should navigate to search page with state', async () => {
    await navigateToSearch('test query')
    expect(vi.mocked(navigate)).toHaveBeenCalledWith('/search/test query', false, {
      header: '2 results found for "test query"',
      results: [
        { $id: '1', name: 'Test Item 1' },
        { $id: '2', name: 'Test Item 2' },
      ],
    })
  })

  it('navigateToSearch B should navigate to item details for exact match', async () => {
    await navigateToSearch('REF123')
    expect(vi.mocked(navigate)).toHaveBeenCalledWith('/item/details/1/single')
  })

  it('navigateToSearch C should navigate to item details for single fuzzy result', async () => {
    const { default: Fuse } = await import('fuse.js/basic')
    vi.spyOn(Fuse.prototype, 'search').mockReturnValueOnce([{ item: { $id: '42', name: 'Only Item' } }] as never)
    await navigateToSearch('only')
    expect(vi.mocked(navigate)).toHaveBeenCalledWith('/item/details/42/single')
  })

  it('navigateToSearch D should fallback to empty id when single result has no id', async () => {
    const { default: Fuse } = await import('fuse.js/basic')
    vi.spyOn(Fuse.prototype, 'search').mockReturnValueOnce([{ item: { name: 'Only Item' } }] as never)
    await navigateToSearch('only')
    expect(vi.mocked(navigate)).toHaveBeenCalledWith('/item/details//single')
  })
})
