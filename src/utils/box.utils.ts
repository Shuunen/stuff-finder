import { capitalize } from 'shuutils'
import type { Item } from '../types/item.types'

const boxColorMap: Record<string, string> = {
  Ab: '#FFD27A',
  Bb: '#9FD3E8',
  Cb: '#B7E5C0',
  Db: '#F0D38F',
  Eb: '#A8DEEC',
  Fb: '#F0A8C8',
  Gb: '#C8E2A0',
  Hb: '#FFB088',
  Ib: '#C0B8E8',
  Jb: '#F2C8D8',
  Kb: '#FF9F9F',
  Lb: '#FFE08A',
  Mb: '#C8D8F0',
  Nb: '#E8C8A0',
  Ob: '#A0D8C8',
  Pb: '#D6B8F0',
  Qb: '#F0B8D0',
  Rb: '#D8C0A0',
  Sb: '#B8D8E8',
  Tb: '#FFC078',
  Ub: '#A8C8D8',
  Vb: '#E8B8E0',
  Wb: '#D0A878',
  Xb: '#E8E8E8',
  Yb: '#FFE8A0',
  Zb: '#C8E8C8',
}

export function boxToLetter(box: string) {
  return box.at(0)?.toUpperCase() ?? '?'
}

const singleLetterBoxPattern = /^\S(?<description>\s*\(.*\))?$/

export function isSingleLetterBox(box: string) {
  return box.trim().length === 0 || singleLetterBoxPattern.test(box.trim())
}

const boxTitlePattern = /^(?<name>[^(]*?)\s*\((?<description>.*)\)\s*$/u

/**
 * Make a box name easier to read, like "B (usb & audio)" becomes "B · Usb & audio"
 * @param box the raw box name
 * @returns the readable title
 */
export function boxToTitle(box: string) {
  const { description = '', name = '' } = boxTitlePattern.exec(box.trim())?.groups ?? {}
  if (description.trim() === '') return box.trim()
  return `${name} · ${capitalize(description.trim(), { lowercaseRest: true })}`
}

export function boxToColor(box: string) {
  const letter = boxToLetter(box)
  return boxColorMap[`${letter}b`] ?? '#E8E8E8'
}

export type DrawerGroup = { drawer: Item['drawer']; items: Item[] }

/**
 * Group items by drawer, sorted by drawer number with the items outside any drawer (-1) last
 * @param items the items to group
 * @returns the groups
 */
export function groupItemsByDrawer(items: Item[]) {
  const groups = new Map<Item['drawer'], Item[]>()
  for (const item of items) groups.set(item.drawer, [...(groups.get(item.drawer) ?? []), item])
  const noDrawer = -1
  return [...groups.entries()]
    .map(([drawer, drawerItems]): DrawerGroup => ({ drawer, items: drawerItems }))
    .toSorted((groupA, groupB) => {
      if (groupA.drawer === noDrawer) return 1
      if (groupB.drawer === noDrawer) return -1
      return groupA.drawer - groupB.drawer
    })
}
