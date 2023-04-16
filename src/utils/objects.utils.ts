import { clone, parseJson } from 'shuutils'
import { logger } from './logger.utils'

export function sortListsEntries<Type = Record<string, string[]>> (record: Type) {
  const output = clone(record)
  // eslint-disable-next-line guard-for-in
  for (const name in output) {
    const values = output[name]
    // eslint-disable-next-line new-cap, @typescript-eslint/no-unnecessary-condition, etc/no-assign-mutated-array, @typescript-eslint/consistent-type-assertions
    if (values !== undefined && Array.isArray(values)) (output as Record<string, string[]>)[name] = ['', ...(values.sort((valueA: string, valueB: string) => Intl.Collator().compare(valueA, valueB)))]
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
