export const itemBoxes = ['A (apple)', 'B (usb & audio)', 'C (couteau)', 'D (doll)', 'E (east)', 'F (périphériques)', 'G (brico & sport)', 'H (hardware)', 'L (lemon)', 'M (malettes)', 'N (noodles)', 'O (orange)', 'P (plan de travail)', 'Q (sock)', 'R (récup)', 'R (red)', 'S (sdb)', 'T (tour bureau)', 'V (violet)', 'X (commode malm)', 'Z (poches zip)'] as const

export const itemStatus = ['bought', 'for-sell', 'lost', 'to-give'] as const

export const uuidMaxLength = 36

export const defaultCommonLists = {
  boxes: ['', ...itemBoxes],
  drawers: ['', '1', '2', '3', '4', '5', '6', '7'],
  statuses: itemStatus,
} as const

export type CommonLists = typeof defaultCommonLists

export const defaultCredentials = {
  bucketId: '',
  collectionId: '',
  databaseId: '',
  wrap: '',
} satisfies Record<string, string>

export type AppCredentials = typeof defaultCredentials

export const defaultImage = '/assets/no-visual.svg'
