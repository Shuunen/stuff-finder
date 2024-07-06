import { pickOne } from 'shuutils'

/**
 * Returns a random cool ascii face
 * @returns {string} A random cool ascii face
 */
export function coolAscii () {
  return pickOne(['( ＾◡＾)', '♥‿♥', '八(＾□＾*)', '(◡ ‿ ◡ ✿)', '(=^ェ^=)', 'ʕ •ᴥ•ʔ', '(*°∀°)', String.raw`\(-ㅂ-)/`, 'ლ(╹◡╹ლ)', 'ლ(o◡oლ)', '＼(＾O＾)／']) /* c8 ignore next */ ?? String.raw`¯\_(ツ)_/¯`
}
