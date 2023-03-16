import { clone, parseJson } from 'shuutils'
import { logger } from './logger.utils'

export function sortListsEntries (record: Record<string, string[]>) {
  const output = clone(record)
  // eslint-disable-next-line guard-for-in
  for (const name in output) {
    const values = output[name]
    // eslint-disable-next-line etc/no-assign-mutated-array, new-cap
    if (values !== undefined) output[name] = ['', ...(values.sort((valueA: string, valueB: string) => Intl.Collator().compare(valueA, valueB)))]
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
