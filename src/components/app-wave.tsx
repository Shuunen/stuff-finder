const squiggleCtrl1 = 0.15
const squiggleAnchor1 = 0.3
const squiggleAnchor2 = 0.6
const squiggleAnchor3 = 0.9
const squiggleEndPad = 2

export function AppWave({ className, width = 120 }: { className?: string; width?: number }) {
  const cp1 = width * squiggleCtrl1
  const an1 = width * squiggleAnchor1
  const an2 = width * squiggleAnchor2
  const an3 = width * squiggleAnchor3
  const endX = width - squiggleEndPad
  return (
    <svg className={className} height="8" viewBox={`0 0 ${width} 8`} width={width}>
      <path d={`M2 5 Q ${cp1} 1, ${an1} 5 T ${an2} 5 T ${an3} 5 L ${endX} 5`} fill="none" stroke="var(--color-primary)" strokeLinecap="round" strokeWidth="2" />
    </svg>
  )
}
