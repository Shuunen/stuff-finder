
export const printSizes = {
  '40x20': {
    styles: {
      aspectRatio: '4/2',
      height: '72px',
      width: '145px',
    },
  },
  '40x30': {
    styles: {
      aspectRatio: '4/3',
      height: '110px',
      width: '145px',
    },
  },
}

export type PrintSize = keyof typeof printSizes
