import { computeRowMoves, type RowSnapshot } from './page-metrics.animation'

describe('page-metrics.animation', () => {
  it('computeRowMoves A should list the rows that moved or whose bar changed', () => {
    const previous = new Map<string, RowSnapshot>([
      ['A', { barPercent: 100, top: 0 }],
      ['B', { barPercent: 50, top: 64 }],
      ['C', { barPercent: 20, top: 128 }],
    ])
    const current = new Map<string, RowSnapshot>([
      ['A', { barPercent: 100, top: 64 }],
      ['B', { barPercent: 50, top: 64 }],
      ['C', { barPercent: 80, top: 128 }],
    ])
    expect(computeRowMoves(previous, current)).toStrictEqual([
      { box: 'A', fromPercent: 100, fromTop: 0, toPercent: 100, toTop: 64 },
      { box: 'C', fromPercent: 20, fromTop: 128, toPercent: 80, toTop: 128 },
    ])
  })

  it('computeRowMoves B should ignore rows that just appeared', () => {
    const current = new Map<string, RowSnapshot>([['A', { barPercent: 100, top: 0 }]])
    expect(computeRowMoves(new Map(), current)).toStrictEqual([])
  })

  it('computeRowMoves C should return nothing when nothing changed', () => {
    const rows = new Map<string, RowSnapshot>([['A', { barPercent: 100, top: 0 }]])
    expect(computeRowMoves(rows, rows)).toStrictEqual([])
  })
})
