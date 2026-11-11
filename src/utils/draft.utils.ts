import { parseJson, Result } from 'shuutils'
import type { Form } from './forms.utils'
import { logger } from './logger.utils'

const draftKeyPrefix = 'stuff-finder-draft'

type DraftValues = Record<string, boolean | string>

/**
 * Get the local storage key of an item form draft
 * @param id the item id, empty for a new item
 * @returns the key
 */
export function getDraftKey(id: string) {
  return `${draftKeyPrefix}-${id === '' ? 'new' : id}`
}

/**
 * Save the field values of a form in the local storage, so it survives a page reload
 * @param key the draft key
 * @param form the form to save
 * @returns a Result
 */
export function saveDraft(key: string, form: Form) {
  const values: DraftValues = {}
  for (const [name, field] of Object.entries(form.fields)) values[name] = field.value
  try {
    globalThis.localStorage.setItem(key, JSON.stringify(values))
    return Result.ok('draft saved')
  } catch (error) {
    logger.error('saveDraft failed', error)
    return Result.error(String(error))
  }
}

/**
 * Remove a saved draft, to call once the form is saved remotely
 * @param key the draft key
 * @returns a Result
 */
export function clearDraft(key: string) {
  try {
    globalThis.localStorage.removeItem(key)
    return Result.ok('draft cleared')
  } catch (error) {
    logger.error('clearDraft failed', error)
    return Result.error(String(error))
  }
}

/**
 * Apply a saved draft on a form
 * @param key the draft key
 * @param form the form to restore, it is not mutated
 * @returns the form with the draft values (and the touched flag) if any draft exists, else the same form
 */
export function restoreDraft<FormType extends Form>(key: string, form: FormType) {
  try {
    const raw = globalThis.localStorage.getItem(key)
    if (raw === null) return form
    const parsed = Result.unwrap(parseJson(raw))
    if (parsed.error || typeof parsed.value !== 'object' || parsed.value === null) {
      logger.warn('restoreDraft : invalid draft', key)
      return form
    }
    const values = parsed.value as DraftValues
    const restored = structuredClone(form)
    for (const [name, field] of Object.entries(restored.fields)) {
      const value = values[name]
      if (typeof value === 'string' && field.type !== 'checkbox') field.value = value
      else if (typeof value === 'boolean' && field.type === 'checkbox') field.value = value
    }
    restored.isTouched = true
    return restored
  } catch (error) {
    logger.error('restoreDraft failed', error)
    return form
  }
}
