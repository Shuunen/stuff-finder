import { test } from 'uvu'
import { equal } from 'uvu/assert'
import { urlToUuid } from '../src/utils/url'

test('urlToUuid', () => {
  equal(urlToUuid('https://wrapapi.com/use/jojo/deyes/json/0.0.2?code=3760052142741&wrapAPIKey=xyz'), 'wrapapicomusejojodeyesjson002code3760052142741')
})

test.run()
