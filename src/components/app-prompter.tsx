import { useEffect, useRef } from 'preact/hooks'
// @ts-expect-error missing types
import { type } from '@camwiegert/typical'
import { delays } from '../constants'
import { coolAscii } from '../utils/strings.utils'

export function AppPrompter () {

  const prompter = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (prompter.current === null) return
    const sequence = ['Stuff Finder', delays.medium, `Stuff Finder\n${coolAscii()}`, delays.large * 2, `Stuff Finder\n${coolAscii()}`] // eslint-disable-line @typescript-eslint/no-magic-numbers
    type(prompter.current, ...sequence) // eslint-disable-line @typescript-eslint/no-unsafe-call
  })

  return (
    <h1 className="mb-12 mt-8 h-20 whitespace-pre text-center text-4xl text-purple-700 print:hidden" ref={prompter}>Hey ^^</h1>
  )
}
