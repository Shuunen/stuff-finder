// @ts-expect-error missing types
import { type } from '@camwiegert/typical'
import { signal, useSignalEffect } from '@preact/signals'
import { useCallback, useRef } from 'preact/hooks'
import { coolAscii } from '../utils/strings.utils'

type TypicalArguments = (number | string)[]

const shortDelay = 200

const longDelay = 600

const sequence = [
  'Stuff Finder',
  shortDelay,
  `Stuff Finder\n${coolAscii()}`, longDelay,
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
