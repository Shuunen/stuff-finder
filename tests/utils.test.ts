import { check, checksRun } from 'shuutils'
import { getAsin, normalizePhotoUrl, urlToUuid } from '../src/utils/url'

check('urlToUuid A', urlToUuid('https://wrapapi.com/use/jojo/deyes/json/0.0.2?code=3760052142741&wrapAPIKey=xyz'), 'wrapapicomusejojodeyesjson002code3760052142741')
check('urlToUuid B', urlToUuid('https://'), '')
check('urlToUuid C', urlToUuid('https://wrapapi.com/use/jojo/deyes/json/0.0.2?code=3760052142741'), 'wrapapicomusejojodeyesjson002code3760052142741')

check('getAsin A', getAsin('https://www.amazon.fr/dp/B07V7GZQJ2'), 'B07V7GZQJ2')
check('getAsin B', getAsin('https://www.amazon.fr/dp/B077QN5GZC?pd_rd_w=uUbTg&content-id=amzn1.sym'), 'B077QN5GZC')
check('getAsin C', getAsin('B077QN5GZC'), 'B077QN5GZC')
check('getAsin D', getAsin('im-no-t-asin'))

const expectedPhotoUrl = 'https://m.media-amazon.com/images/I/41eTyK5fGVL._SL500_.jpg'
check('normalizePhotoUrl A', normalizePhotoUrl('https://m.media-amazon.com/images/I/41eTyK5fGVL._SY90_.jpg'), expectedPhotoUrl)
check('normalizePhotoUrl B', normalizePhotoUrl('https://m.media-amazon.com/images/I/41eTyK5fGVL._AC_SL1500_.jpg'), expectedPhotoUrl)
check('normalizePhotoUrl C', normalizePhotoUrl('https://my-server-L1500_.jpg'), 'https://my-server-L1500_.jpg')

checksRun()
