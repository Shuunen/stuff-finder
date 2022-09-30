import { check, checksRun } from 'shuutils'
import { urlToUuid } from '../src/utils/url'

check('urlToUuid A', urlToUuid('https://wrapapi.com/use/jojo/deyes/json/0.0.2?code=3760052142741&wrapAPIKey=xyz'), 'wrapapicomusejojodeyesjson002code3760052142741')
check('urlToUuid B', urlToUuid('https://'), '')
check('urlToUuid C', urlToUuid('https://wrapapi.com/use/jojo/deyes/json/0.0.2?code=3760052142741'), 'wrapapicomusejojodeyesjson002code3760052142741')

checksRun()
