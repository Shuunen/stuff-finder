import type { ReactNode } from 'react'
import { AppTape } from './app-tape'

type Props = Readonly<{
  children: ReactNode
  name: string
}>

export function AppPageSubtitle({ children, name }: Props) {
  return (
    <div className="my-3 flex px-5">
      <div className="relative max-w-full rotate-1 px-6 py-1.5">
        <h2 data-testid={`${name}-subtitle`} className="relative z-20 text-2xl md:text-3xl">
          {children}
        </h2>
        <AppTape className="absolute inset-0 z-0 aspect-auto h-auto bg-amber-200" />
      </div>
    </div>
  )
}
