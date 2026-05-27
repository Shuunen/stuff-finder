import { getAsin, normalizePhotoUrl, urlToUuid } from './url.utils'

describe('urlToUuid', () => {
  it('A with api key in url', () => {
    expect(urlToUuid('https://wrapapi.com/use/jojo/deyes/json/0.0.2?code=3760052142741&wrapAPIKey=xyz')).toBe('wrapapicomusejojodeyesjson002code3760052142741')
  })
  it('B empty url', () => {
    expect(urlToUuid('https://')).toBe('')
  })
  it('C without api key', () => {
    expect(urlToUuid('https://wrapapi.com/use/jojo/deyes/json/0.0.2?code=3760052142741')).toBe('wrapapicomusejojodeyesjson002code3760052142741')
  })
})

describe('getAsin', () => {
  it('A amazon url', () => {
    expect(getAsin('https://www.amazon.fr/dp/B07V7GZQJ2')).toBe('B07V7GZQJ2')
  })
  it('B amazon url with query params', () => {
    expect(getAsin('https://www.amazon.fr/dp/B077QN5GZC?pd_rd_w=uUbTg&content-id=amzn1.sym')).toBe('B077QN5GZC')
  })
  it('C plain asin', () => {
    expect(getAsin('B077QN5GZC')).toBe('B077QN5GZC')
  })
  it('D non-asin string', () => {
    expect(getAsin('im-no-t-asin')).toBeUndefined()
  })
})

describe('normalizePhotoUrl', () => {
  it('A amazon SY size', () => {
    expect(normalizePhotoUrl('https://m.media-amazon.com/images/I/41eTyK5fGVL._SY90_.jpg')).toMatchInlineSnapshot('"https://m.media-amazon.com/images/I/41eTyK5fGVL._SL500_.jpg"')
  })
  it('A bis amazon SX size', () => {
    expect(normalizePhotoUrl('https://m.media-amazon.com/images/I/41eTyK5fGVL._SX90_.jpg')).toMatchInlineSnapshot('"https://m.media-amazon.com/images/I/41eTyK5fGVL._SL500_.jpg"')
  })
  it('B amazon AC_SL size', () => {
    expect(normalizePhotoUrl('https://m.media-amazon.com/images/I/41eTyK5fGVL._AC_SL1500_.jpg')).toMatchInlineSnapshot('"https://m.media-amazon.com/images/I/41eTyK5fGVL._SL500_.jpg"')
  })
  it('C no recognized pattern', () => {
    expect(normalizePhotoUrl('https://my-server-L1500_.jpg')).toMatchInlineSnapshot('"https://my-server-L1500_.jpg"')
  })
  it('D kwcdn imageView2', () => {
    expect(normalizePhotoUrl('https://img.kwcdn.com/product/1e29826bd4/963d0c2a-db96-4253-8dde-3d617ad0e4c3_800x800.jpeg?imageView2/2/w/300/q/70/format/webp')).toMatchInlineSnapshot(
      '"https://img.kwcdn.com/product/1e29826bd4/963d0c2a-db96-4253-8dde-3d617ad0e4c3_800x800.jpeg?imageView2/2/w/500/q/70/format/webp"',
    )
  })
  it('E amazon ssl-images', () => {
    expect(normalizePhotoUrl('https://images-eu.ssl-images-amazon.com/images/I/71Jn92-Km8L._AC_UL160_SR160,160_.jpg')).toMatchInlineSnapshot('"https://images-eu.ssl-images-amazon.com/images/I/71Jn92-Km8L._SL500_.jpg"')
  })
  it('F decathlon f= param', () => {
    expect(normalizePhotoUrl('https://contents.mediadecathlon.com/p2383266/k$d2f0d767bdc9b064e7e28216ab817e35/sq/SPRAY+GACHETTE+SOLAIRE+ACTIVE+IP50+250+ML.webp?f=100x100')).toMatchInlineSnapshot(
      '"https://contents.mediadecathlon.com/p2383266/k$d2f0d767bdc9b064e7e28216ab817e35/sq/SPRAY+GACHETTE+SOLAIRE+ACTIVE+IP50+250+ML.webp?f=500x500"',
    )
  })
  it('G amazon SS size', () => {
    expect(normalizePhotoUrl('https://m.media-amazon.com/images/I/41z6iny2jTL._SS142_.jpg')).toMatchInlineSnapshot('"https://m.media-amazon.com/images/I/41z6iny2jTL._SL500_.jpg"')
  })
  it('H alicdn jpg_NNNxNNN', () => {
    expect(normalizePhotoUrl('https://ae01.alicdn.com/kf/S8a947aca823d4f4e9b26cd232f319cc6i.jpg_220x220.jpg')).toMatchInlineSnapshot(`"https://ae01.alicdn.com/kf/S8a947aca823d4f4e9b26cd232f319cc6i.jpg_500x500q85.jpg"`)
  })
  it('I aliexpress-media jpg NNNxNNNqNN avif', () => {
    expect(normalizePhotoUrl('https://ae-pic-a1.aliexpress-media.com/kf/S4c8a070043c446cca2f5ef55ba3962f8J.jpg_960x960q75.jpg_.avif')).toMatchInlineSnapshot(
      `"https://ae-pic-a1.aliexpress-media.com/kf/S4c8a070043c446cca2f5ef55ba3962f8J.jpg_500x500q85.jpg"`,
    )
  })
})
