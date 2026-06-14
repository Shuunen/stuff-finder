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
  Xb: '#C8C8C8',
  Yb: '#FFE8A0',
  Zb: '#C8E8C8',
}

export function boxToLetter(box: string) {
  return box.at(0)?.toUpperCase() ?? '?'
}

export function boxToColor(box: string) {
  const letter = boxToLetter(box)
  return boxColorMap[`${letter}b`] ?? '#C8C8C8'
}
