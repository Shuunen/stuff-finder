import type { ReactNode } from 'react'
import { AppTape } from './app-tape'

type Props = Readonly<{
  children: ReactNode
  name: string
}>

export function AppPageTitle({ children, name }: Props) {
  return (
    <div className="my-6 flex justify-center px-6">
      <div className="relative max-w-full -rotate-2 px-12 py-3">
        <h1 data-testid={`${name}-title`} className="relative z-20 text-center text-4xl md:text-5xl">
          {children}
        </h1>
        <AppTape className="absolute inset-0 z-0 aspect-auto h-auto bg-white" />
      </div>
    </div>
  )
}
