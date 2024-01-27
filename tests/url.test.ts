import { expect, it } from 'vitest'  
import { getAsin, normalizePhotoUrl, urlToUuid } from '../src/utils/url.utils'

it('urlToUuid A', () => { expect(urlToUuid('https://wrapapi.com/use/jojo/deyes/json/0.0.2?code=3760052142741&wrapAPIKey=xyz')).toEqual('wrapapicomusejojodeyesjson002code3760052142741') })
it('urlToUuid B', () => { expect(urlToUuid('https://')).toEqual('') })
it('urlToUuid C', () => { expect(urlToUuid('https://wrapapi.com/use/jojo/deyes/json/0.0.2?code=3760052142741')).toEqual('wrapapicomusejojodeyesjson002code3760052142741') })

it('getAsin A', () => { expect(getAsin('https://www.amazon.fr/dp/B07V7GZQJ2')).toEqual('B07V7GZQJ2') })
it('getAsin B', () => { expect(getAsin('https://www.amazon.fr/dp/B077QN5GZC?pd_rd_w=uUbTg&content-id=amzn1.sym')).toEqual('B077QN5GZC') })
it('getAsin C', () => { expect(getAsin('B077QN5GZC')).toEqual('B077QN5GZC') })
it('getAsin D', () => { expect(getAsin('im-no-t-asin')).toBeUndefined() })

it('normalizePhotoUrl A', () => { expect(normalizePhotoUrl('https://m.media-amazon.com/images/I/41eTyK5fGVL._SY90_.jpg')).toMatchInlineSnapshot('"https://m.media-amazon.com/images/I/41eTyK5fGVL._SL500_.jpg"') })
it('normalizePhotoUrl A bis', () => { expect(normalizePhotoUrl('https://m.media-amazon.com/images/I/41eTyK5fGVL._SX90_.jpg')).toMatchInlineSnapshot('"https://m.media-amazon.com/images/I/41eTyK5fGVL._SL500_.jpg"') })
it('normalizePhotoUrl B', () => { expect(normalizePhotoUrl('https://m.media-amazon.com/images/I/41eTyK5fGVL._AC_SL1500_.jpg')).toMatchInlineSnapshot('"https://m.media-amazon.com/images/I/41eTyK5fGVL._SL500_.jpg"') })
it('normalizePhotoUrl C', () => { expect(normalizePhotoUrl('https://my-server-L1500_.jpg')).toMatchInlineSnapshot('"https://my-server-L1500_.jpg"') })
it('normalizePhotoUrl D', () => { expect(normalizePhotoUrl('https://img.kwcdn.com/product/1e29826bd4/963d0c2a-db96-4253-8dde-3d617ad0e4c3_800x800.jpeg?imageView2/2/w/300/q/70/format/webp')).toMatchInlineSnapshot('"https://img.kwcdn.com/product/1e29826bd4/963d0c2a-db96-4253-8dde-3d617ad0e4c3_800x800.jpeg?imageView2/2/w/500/q/70/format/webp"') })
it('normalizePhotoUrl E', () => { expect(normalizePhotoUrl('https://images-eu.ssl-images-amazon.com/images/I/71Jn92-Km8L._AC_UL160_SR160,160_.jpg')).toMatchInlineSnapshot('"https://images-eu.ssl-images-amazon.com/images/I/71Jn92-Km8L._SL500_.jpg"') })
it('normalizePhotoUrl F', () => { expect(normalizePhotoUrl('https://contents.mediadecathlon.com/p2383266/k$d2f0d767bdc9b064e7e28216ab817e35/sq/SPRAY+GACHETTE+SOLAIRE+ACTIVE+IP50+250+ML.webp?f=100x100')).toMatchInlineSnapshot('"https://contents.mediadecathlon.com/p2383266/k$d2f0d767bdc9b064e7e28216ab817e35/sq/SPRAY+GACHETTE+SOLAIRE+ACTIVE+IP50+250+ML.webp?f=500x500"') })
