import { arrayUnique, clone } from 'shuutils'

/**
 * Sort lists
 * @param record the lists to sort
 * @returns the sorted list... unexpected right ?
 */
export function sortListsEntries<Type = Record<string, string[]>> (record: Type) {
  const output = clone<Type>(record)
  // @ts-expect-error problem with Object.entries
  const entries = Object.entries<string[]>(output)
  for (const [name, values] of entries) if (Array.isArray(values)) {
    // eslint-disable-next-line new-cap
    const updatedValues = ['', ...values.sort((valueA: string, valueB: string) => Intl.Collator().compare(valueA, valueB))];
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion
    (output as Record<string, string[]>)[name] = arrayUnique(updatedValues)
  }
  return output
}
