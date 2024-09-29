import { signal, useSignalEffect } from '@preact/signals'
// @ts-expect-error missing types
import { type } from '@camwiegert/typical'
import { useCallback, useRef } from 'preact/hooks'
import { delays } from '../constants'
import { coolAscii } from '../utils/strings.utils'

type TypicalArguments = (number | string)[]

const sequence = [
  'Stuff Finder',
  delays.medium,
  `Stuff Finder\n${coolAscii()}`, delays.large * 2, // eslint-disable-line @typescript-eslint/no-magic-numbers
  `Stuff Finder\n${coolAscii()}`,
] satisfies TypicalArguments

export function AppPrompter () {

  const prompterReference = useRef<HTMLHeadingElement>(null)
  const prompter = signal(prompterReference)

  useSignalEffect(useCallback(() => {
    if (prompter.value.current === null) return
    type(prompter.value.current, ...sequence) // eslint-disable-line @typescript-eslint/no-unsafe-call
  }, [prompter.value]))

  return (
    <h1 class="mb-12 mt-8 h-20 whitespace-pre text-center print:hidden" data-component="prompter" ref={prompterReference}>Hey ^^</h1>
  )
}
