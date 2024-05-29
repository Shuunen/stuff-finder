import { pickOne } from 'shuutils'

export function coolAscii () {
  return pickOne(['( ＾◡＾)', '♥‿♥', '八(＾□＾*)', '(◡ ‿ ◡ ✿)', '(=^ェ^=)', 'ʕ •ᴥ•ʔ', '(*°∀°)', String.raw`\(-ㅂ-)/`, 'ლ(╹◡╹ლ)', 'ლ(o◡oლ)', '＼(＾O＾)／']) /* c8 ignore next */ ?? String.raw`¯\_(ツ)_/¯`
}
