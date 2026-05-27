export const itemBoxes = [
  'A (apple)',
  'B (usb & audio)',
  'Blue',
  'Bureau',
  'C (couteau)',
  'Chambre',
  'Cuisine',
  'D (doll)',
  'E (east)',
  'Entrée',
  'F (périphériques)',
  'G (brico & sport)',
  'Green',
  'Garage',
  'H (hardware)',
  'J (à donner)',
  'L (lemon)',
  'M (malettes)',
  'N (noodles)',
  'O (orange)',
  'P (plan de travail)',
  'Q (sock)',
  'R (récup)',
  'R (red)',
  'S (sdb)',
  'Salle de bain',
  'Salon',
  'T (tour bureau)',
  'Terrasse',
  'V (violet)',
  'X (commode malm)',
  'Yellow',
  'Z (poches zip)',
] as const

export const boxRooms = {
  bureau: ['E', 'P', 'Q', 'T', 'Z', 'Bureau'] satisfies string[],
  cuisine: ['Cuisine'] satisfies string[],
  entrée: ['A', 'B', 'D', 'H', 'M', 'O', 'W', 'R', 'V', 'Entrée'] satisfies string[],
  garage: ['Garage'] satisfies string[],
  'salle de bain': ['S', 'Salle de bain'] satisfies string[],
  salon: ['G', 'C', 'X', 'N', 'Salon'] satisfies string[],
  terrasse: ['Terrasse'] satisfies string[],
} as const

export const itemStatus = ['bought', 'for-sell', 'lost', 'to-give'] as const

export const itemDrawers = ['1', '2', '3', '4', '5', '6', '7'] as const

export const uuidMaxLength = 36

export const defaultCredentials = {
  bucketId: '',
  collectionId: '',
  databaseId: '',
  wrap: '',
} satisfies Record<string, string>

export const defaultImage = '/assets/no-visual.svg'
