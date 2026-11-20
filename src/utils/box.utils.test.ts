import { boxToColor, boxToLetter, boxToTitle, groupItemsByDrawer, isSingleLetterBox } from './box.utils'
import { emptyItem } from './item.utils'

describe('box utils', () => {
  describe('boxToLetter', () => {
    it('extracts the first letter uppercase from a box string', () => {
      expect(boxToLetter('B (usb & audio)')).toBe('B')
      expect(boxToLetter('h (hardware)')).toBe('H')
      expect(boxToLetter('A')).toBe('A')
    })

    it('returns ? for empty string', () => {
      expect(boxToLetter('')).toBe('?')
    })
  })

  describe('isSingleLetterBox', () => {
    it('is true for a letter with or without a parenthesized description', () => {
      expect(isSingleLetterBox('X')).toBe(true)
      expect(isSingleLetterBox('X (commode malm)')).toBe(true)
      expect(isSingleLetterBox('')).toBe(true)
    })

    it('is false for a multi-character name', () => {
      expect(isSingleLetterBox('Garage')).toBe(false)
      expect(isSingleLetterBox('Garage (tools)')).toBe(false)
    })
  })

  describe('boxToTitle', () => {
    it('formats the description after a dot', () => {
      expect(boxToTitle('B (usb & audio)')).toBe('B · Usb & audio')
    })

    it('keeps names without description', () => {
      expect(boxToTitle('B')).toBe('B')
      expect(boxToTitle('Cables')).toBe('Cables')
    })
  })

  describe('boxToColor', () => {
    it('returns a known pastel color for mapped letters', () => {
      expect(boxToColor('B (usb & audio)')).toBe('#9FD3E8')
      expect(boxToColor('A')).toBe('#FFD27A')
      expect(boxToColor('H')).toBe('#FFB088')
    })

    it('returns fallback color for unknown letters', () => {
      expect(boxToColor('1 (unknown)')).toBe('#E8E8E8')
    })
  })

  describe('groupItemsByDrawer', () => {
    it('groups items by drawer, sorted, with items outside a drawer last', () => {
      const itemA = { ...emptyItem, $id: 'a', drawer: 3 }
      const itemB = { ...emptyItem, $id: 'b', drawer: -1 }
      const itemC = { ...emptyItem, $id: 'c', drawer: 1 }
      const itemD = { ...emptyItem, $id: 'd', drawer: 3 }
      const groups = groupItemsByDrawer([itemA, itemB, itemC, itemD])
      expect(groups.map(group => group.drawer)).toStrictEqual([1, 3, -1])
      expect(groups[1]?.items).toStrictEqual([itemA, itemD])
    })

    it('returns no group for no items', () => {
      expect(groupItemsByDrawer([])).toStrictEqual([])
    })
  })
})
