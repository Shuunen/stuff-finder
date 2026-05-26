// @ts-expect-error missing types
import { type } from '@camwiegert/typical'
import { signal, useSignalEffect } from '@preact/signals'
import { useCallback, useRef } from 'preact/hooks'
import { coolAscii } from '../utils/strings.utils'

type TypicalArguments = (number | string)[]

const shortDelay = 200

const longDelay = 600

const sequence = ['Stuff Finder', shortDelay, `Stuff Finder\n${coolAscii()}`, longDelay, `Stuff Finder\n${coolAscii()}`] satisfies TypicalArguments

export function AppPrompter() {
  const prompterReference = useRef<HTMLHeadingElement>(null)
  const prompter = signal(prompterReference)

  useSignalEffect(
    useCallback(() => {
      if (prompter.value.current === null) return
      // oxlint-disable-next-line typescript/no-unsafe-call
      type(prompter.value.current, ...sequence)
    }, [prompter.value]),
  )

  return (
    <h1 class="mt-8 mb-12 h-20 text-center whitespace-pre print:hidden" data-component="prompter" ref={prompterReference}>
      Hey ^^
    </h1>
  )
}
