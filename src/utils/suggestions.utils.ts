import { capitalize, clone } from 'shuutils'
import { ItemField } from '../types'

const keysToCapitalize = new Set([ItemField.Name.toString(), ItemField.Details.toString()])

export function cleanSuggestions (suggestionsInput: Record<string, string[] | undefined>) {
  const suggestions = clone(suggestionsInput)
  Object.keys(suggestions).forEach((key) => {
    /* c8 ignore next */
    let values = suggestions[key] ?? []
    if (keysToCapitalize.has(key)) values = values.map(value => capitalize(value, true))
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    if (values.length === 0) delete suggestions[key] // clear empty fields
    else suggestions[key] = values.filter((value, index, array) => array.indexOf(value) === index) // remove duplicates
  })
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return suggestions as Record<string, string[]>
}
