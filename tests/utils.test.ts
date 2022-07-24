import { check } from 'shuutils'
import { urlToUuid } from '../src/utils/url'

check('urlToUuid', urlToUuid('https://wrapapi.com/use/jojo/deyes/json/0.0.2?code=3760052142741&wrapAPIKey=xyz'), 'wrapapicomusejojodeyesjson002code3760052142741')

check.run()
