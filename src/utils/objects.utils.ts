import { arrayUnique, clone } from 'shuutils'

export function sortListsEntries<Type = Record<string, string[]>> (record: Type) {
  const output = clone<Type>(record)
  // @ts-expect-error problem with Object.entries
  const entries = Object.entries<string[]>(output)
  for (const [name, values] of entries) if (Array.isArray(values)) {
    // eslint-disable-next-line etc/no-assign-mutated-array, new-cap, sonar/new-cap, functional/immutable-data
    const updatedValues = ['', ...values.sort((valueA: string, valueB: string) => Intl.Collator().compare(valueA, valueB))];
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, functional/immutable-data
    (output as Record<string, string[]>)[name] = arrayUnique(updatedValues)
  }
  return output
}
