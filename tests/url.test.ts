import { expect, it } from 'vitest'
import { getAsin, normalizePhotoUrl, urlToUuid } from '../src/utils/url.utils'

it('urlToUuid A', () => { expect(urlToUuid('https://wrapapi.com/use/jojo/deyes/json/0.0.2?code=3760052142741&wrapAPIKey=xyz')).toEqual('wrapapicomusejojodeyesjson002code3760052142741') })
it('urlToUuid B', () => { expect(urlToUuid('https://')).toEqual('') })
it('urlToUuid C', () => { expect(urlToUuid('https://wrapapi.com/use/jojo/deyes/json/0.0.2?code=3760052142741')).toEqual('wrapapicomusejojodeyesjson002code3760052142741') })

it('getAsin A', () => { expect(getAsin('https://www.amazon.fr/dp/B07V7GZQJ2')).toEqual('B07V7GZQJ2') })
it('getAsin B', () => { expect(getAsin('https://www.amazon.fr/dp/B077QN5GZC?pd_rd_w=uUbTg&content-id=amzn1.sym')).toEqual('B077QN5GZC') })
it('getAsin C', () => { expect(getAsin('B077QN5GZC')).toEqual('B077QN5GZC') })
it('getAsin D', () => { expect(getAsin('im-no-t-asin')).toBeUndefined() })

const expectedPhotoUrl = 'https://m.media-amazon.com/images/I/41eTyK5fGVL._SL500_.jpg'
it('normalizePhotoUrl A', () => { expect(normalizePhotoUrl('https://m.media-amazon.com/images/I/41eTyK5fGVL._SY90_.jpg')).toEqual(expectedPhotoUrl) })
it('normalizePhotoUrl B', () => { expect(normalizePhotoUrl('https://m.media-amazon.com/images/I/41eTyK5fGVL._AC_SL1500_.jpg')).toEqual(expectedPhotoUrl) })
it('normalizePhotoUrl C', () => { expect(normalizePhotoUrl('https://my-server-L1500_.jpg')).toEqual('https://my-server-L1500_.jpg') })

