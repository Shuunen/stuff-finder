import { check, checksRun } from 'shuutils'
import { getAsin, urlToUuid } from '../src/utils/url'

check('urlToUuid A', urlToUuid('https://wrapapi.com/use/jojo/deyes/json/0.0.2?code=3760052142741&wrapAPIKey=xyz'), 'wrapapicomusejojodeyesjson002code3760052142741')
check('urlToUuid B', urlToUuid('https://'), '')
check('urlToUuid C', urlToUuid('https://wrapapi.com/use/jojo/deyes/json/0.0.2?code=3760052142741'), 'wrapapicomusejojodeyesjson002code3760052142741')

check('getAsin A', getAsin('https://www.amazon.fr/dp/B07V7GZQJ2'), 'B07V7GZQJ2')
check('getAsin B', getAsin('https://www.amazon.fr/dp/B077QN5GZC?pd_rd_w=uUbTg&content-id=amzn1.sym'), 'B077QN5GZC')
check('getAsin C', getAsin('B077QN5GZC'), 'B077QN5GZC')
check('getAsin D', getAsin('im-no-t-asin'))

checksRun()
