import { useState, type ImgHTMLAttributes } from 'react'
import { cn } from '../utils/class.utils'

const fallbackImage = '/assets/no-visual.svg'
const redishFilter = '[filter:sepia(1)_saturate(6)_hue-rotate(-50deg)]'

export function AppItemImage({ className, src, onError, ...props }: Readonly<ImgHTMLAttributes<HTMLImageElement>>) {
  const [failedSrc, setFailedSrc] = useState<string | undefined>()
  const hasFailed = failedSrc === src
  return (
    <img
      {...props}
      className={cn(className, hasFailed && redishFilter)}
      onError={event => {
        setFailedSrc(src)
        onError?.(event)
      }}
      src={hasFailed ? fallbackImage : src}
    />
  )
}
