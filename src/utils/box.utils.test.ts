import { boxToColor, boxToLetter } from './box.utils'

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

  describe('boxToColor', () => {
    it('returns a known pastel color for mapped letters', () => {
      expect(boxToColor('B (usb & audio)')).toBe('#9FD3E8')
      expect(boxToColor('A')).toBe('#FFD27A')
      expect(boxToColor('H')).toBe('#FFB088')
    })
    it('returns fallback color for unknown letters', () => {
      expect(boxToColor('1 (unknown)')).toBe('#C8C8C8')
    })
  })
})
