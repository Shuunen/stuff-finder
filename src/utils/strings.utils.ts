import { pickOne } from 'shuutils'

/**
 * Returns a random cool ascii face
 * @returns a random cool ascii face
 */
export function coolAscii () {
  return pickOne(['( ＾◡＾)', '♥‿♥', '八(＾□＾*)', '(◡ ‿ ◡ ✿)', '(=^ェ^=)', 'ʕ •ᴥ•ʔ', '(*°∀°)', String.raw`\(-ㅂ-)/`, 'ლ(╹◡╹ლ)', 'ლ(o◡oლ)', '＼(＾O＾)／'])
}

/**
 * Returns a random sad ascii face
 * @returns a random sad ascii face
 */
export function sadAscii () {
  return pickOne(['(╥﹏╥)', '(T_T)', '(×_×)', '(TдT)', '(╯︵╰,)'])
}
