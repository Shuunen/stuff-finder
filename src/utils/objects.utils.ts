import { arrayUnique, clone, parseJson } from 'shuutils'
import { logger } from './logger.utils'

export function sortListsEntries<Type = Record<string, string[]>> (record: Type) {
  const output = clone(record)
  // @ts-expect-error problem with Object.entries
  for (const [name, values] of Object.entries<string[]>(output)) if (Array.isArray(values)) {
    // eslint-disable-next-line etc/no-assign-mutated-array, new-cap
    const updatedValues = ['', ...(values.sort((valueA: string, valueB: string) => Intl.Collator().compare(valueA, valueB)))];
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    (output as Record<string, string[]>)[name] = arrayUnique(updatedValues)
  }
  return output
}

export function getObjectOrSelf<Type> (input?: Type) {
  if (typeof input === 'string' && input.startsWith('{')) {
    const { error, value } = parseJson<object>(input)
    if (error) logger.showError(error)
    return value
  }
  return input
}
