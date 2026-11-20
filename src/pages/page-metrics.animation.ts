export type RowSnapshot = {
  /** width of the bar in percent */
  barPercent: number
  /** distance between the row and the top of the list */
  top: number
}

export type RowMove = {
  box: string
  fromPercent: number
  fromTop: number
  toPercent: number
  toTop: number
}

const rowDurationMs = 450
const barDelayMs = 250

const rowOptions = { duration: rowDurationMs, easing: 'cubic-bezier(0.2, 0, 0.3, 1)' } satisfies KeyframeAnimationOptions

/**
 * List the rows that moved or whose bar changed between two renders
 * @param previous the rows before the render
 * @param current the rows after the render
 * @returns the rows to animate, rows that just appeared are left out
 */
export function computeRowMoves(previous: ReadonlyMap<string, RowSnapshot>, current: ReadonlyMap<string, RowSnapshot>) {
  const moves: RowMove[] = []
  for (const [box, now] of current) {
    const before = previous.get(box)
    if (before && (before.top !== now.top || before.barPercent !== now.barPercent)) moves.push({ box, fromPercent: before.barPercent, fromTop: before.top, toPercent: now.barPercent, toTop: now.top })
  }
  return moves
}

/* v8 ignore start */
/**
 * Measure the rows of the list, each row is a direct child of the list with a data-box attribute
 * @param list the element holding the rows
 * @param rows the rows with their bar width
 * @returns the position and bar width of each row
 */
export function readRowSnapshots(list: HTMLElement, rows: readonly { barPercent: number; box: string }[]) {
  const percents = new Map(rows.map(row => [row.box, row.barPercent]))
  const snapshots = new Map<string, RowSnapshot>()
  for (const element of list.children) {
    const box = element instanceof HTMLElement ? element.dataset.box : undefined
    const barPercent = box === undefined ? undefined : percents.get(box)
    if (box !== undefined && barPercent !== undefined) snapshots.set(box, { barPercent, top: (element as HTMLElement).offsetTop })
  }
  return snapshots
}

function prefersReducedMotion() {
  return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

function findBar(element: HTMLElement) {
  return element.querySelector<HTMLElement>('[data-testid="metric-entry-bar"]')
}

/**
 * Slide each moved row from its old place, then grow or shrink its bar from its old width a bit later
 * @param list the element holding the rows
 * @param moves the rows to animate
 */
export function playRowMoves(list: HTMLElement, moves: readonly RowMove[]) {
  if (prefersReducedMotion()) return
  for (const element of list.children) {
    const move = element instanceof HTMLElement ? moves.find(candidate => candidate.box === element.dataset.box) : undefined
    if (move && element instanceof HTMLElement) {
      element.animate([{ transform: `translateY(${move.fromTop - move.toTop}px)` }, { transform: 'translateY(0)' }], rowOptions)
      // the bar keeps its old width during the delay, so it moves after the sorting
      findBar(element)?.animate([{ width: `${move.fromPercent}%` }, { width: `${move.toPercent}%` }], { ...rowOptions, delay: barDelayMs, fill: 'backwards' })
    }
  }
}

/* v8 ignore stop */
