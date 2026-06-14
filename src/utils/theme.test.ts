import { colSpanClass, gridClass, theme } from './theme.utils'

describe('theme', () => {
  it('A primary palette', () => {
    expect(theme.palette.primary).toMatchInlineSnapshot(`
      {
        "contrastText": "#fff",
        "dark": "#1565c0",
        "light": "#42a5f5",
        "main": "#1976d2",
      }
    `)
  })
})

describe('gridClass', () => {
  it('A 1 column', () => {
    expect(gridClass(1)).toBe('md:grid-cols-1')
  })
  it('B 2 columns', () => {
    expect(gridClass(2)).toBe('md:grid-cols-2')
  })
  it('C 3 columns', () => {
    expect(gridClass(3)).toBe('md:grid-cols-3')
  })
  it('D 4 columns', () => {
    expect(gridClass(4)).toBe('md:grid-cols-4')
  })
  it('E 5 columns', () => {
    expect(gridClass(5)).toBe('md:grid-cols-5')
  })
  it('F 6 columns', () => {
    expect(gridClass(6)).toBe('md:grid-cols-6')
  })
  it('G 7 columns', () => {
    expect(gridClass(7)).toBe('md:grid-cols-7')
  })
  it('H 8 columns', () => {
    expect(gridClass(8)).toBe('md:grid-cols-8')
  })
  it('I 9 columns', () => {
    expect(gridClass(9)).toBe('md:grid-cols-9')
  })
  it('J 10 columns', () => {
    expect(gridClass(10)).toBe('md:grid-cols-10')
  })
  it('G default', () => {
    expect(gridClass()).toBe('md:grid-cols-1')
  })
})

describe('colSpanClass', () => {
  it('A 1 column', () => {
    expect(colSpanClass(1)).toBe('md:col-span-1')
  })
  it('B 2 columns', () => {
    expect(colSpanClass(2)).toBe('md:col-span-2')
  })
  it('C 3 columns', () => {
    expect(colSpanClass(3)).toBe('md:col-span-3')
  })
  it('D 4 columns', () => {
    expect(colSpanClass(4)).toBe('md:col-span-4')
  })
  it('E 5 columns', () => {
    expect(colSpanClass(5)).toBe('md:col-span-5')
  })
  it('F 6 columns', () => {
    expect(colSpanClass(6)).toBe('md:col-span-6')
  })
  it('G 7 columns', () => {
    expect(colSpanClass(7)).toBe('md:col-span-7')
  })
  it('H 8 columns', () => {
    expect(colSpanClass(8)).toBe('md:col-span-8')
  })
  it('I 9 columns', () => {
    expect(colSpanClass(9)).toBe('md:col-span-9')
  })
  it('J 10 columns', () => {
    expect(colSpanClass(10)).toBe('md:col-span-10')
  })
})
