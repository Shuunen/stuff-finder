// @ts-expect-error missing types
import { type } from '@camwiegert/typical'
import { useEffect, useRef } from 'react'
import { coolAscii } from '../utils/strings.utils'

type TypicalArguments = (number | string)[]

const shortDelay = 200

const longDelay = 600

const sequence = ['Stuff Finder', shortDelay, `Stuff Finder\n${coolAscii()}`, longDelay, `Stuff Finder\n${coolAscii()}`] satisfies TypicalArguments

export function AppPrompter() {
  const prompterReference = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (prompterReference.current === null) return
    // oxlint-disable-next-line typescript/no-unsafe-call
    type(prompterReference.current, ...sequence)
  }, [])

  return (
    <h1 className="mt-8 mb-12 h-20 text-center whitespace-pre print:hidden" data-component="prompter" ref={prompterReference}>
      Hey ^^
    </h1>
  )
}
