import { strictEqual as equal } from 'assert'
import { test } from 'uvu'
import { button } from '../src/utils'

test('button', () => {
  const button_ = button('A')
  equal(button_.tagName, 'BUTTON')
  equal(button_.textContent, 'A')
  equal(button_.type, 'button')
  equal(button_.disabled, false)
})

test.run()
