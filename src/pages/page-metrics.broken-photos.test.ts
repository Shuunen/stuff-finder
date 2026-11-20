import { mockItem } from '../utils/mock.utils'
import { findItemsWithBrokenPhoto } from './page-metrics.broken-photos'

describe('findItemsWithBrokenPhoto', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return only the items whose photo fails to decode', async () => {
    const broken = mockItem({ $id: 'broken', photos: ['broken-photo'] })
    const working = mockItem({ $id: 'working', photos: ['working-photo'] })
    const withoutPhoto = mockItem({ $id: 'none', photos: [] })
    const decode = vi.fn<() => Promise<void>>()
    vi.spyOn(document, 'createElement').mockImplementation(() => {
      const image = { decode, src: '' }
      decode.mockImplementationOnce(async () => {
        await (image.src.includes('broken-photo') ? Promise.reject(new Error('failed')) : Promise.resolve())
      })
      return image as unknown as HTMLImageElement
    })
    const result = await findItemsWithBrokenPhoto([broken, working, withoutPhoto])
    expect(result.map(item => item.$id)).toStrictEqual(['broken'])
    expect(decode).toHaveBeenCalledTimes(2)
  })
})
