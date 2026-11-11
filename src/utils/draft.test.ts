import { clearDraft, getDraftKey, restoreDraft, saveDraft } from './draft.utils'
import { itemForm } from './item.utils'

describe('draft.utils', () => {
  const key = getDraftKey('')
  beforeEach(() => {
    globalThis.localStorage.clear()
  })

  it('getDraftKey A new item and an existing item have different keys', () => {
    expect(key).not.toBe(getDraftKey('abc'))
  })

  it('restoreDraft B returns the same form when there is no draft', () => {
    expect(restoreDraft(key, itemForm)).toBe(itemForm)
  })

  it('saveDraft C then restoreDraft restores the values', () => {
    const form = structuredClone(itemForm)
    form.fields.name.value = 'hammer'
    form.fields.isPrinted.value = true
    expect(saveDraft(key, form).ok).toBe(true)
    const restored = restoreDraft(key, itemForm)
    expect(restored.fields.name.value).toBe('hammer')
    expect(restored.fields.isPrinted.value).toBe(true)
    expect(restored.isTouched).toBe(true)
    expect(itemForm.fields.name.value).toBe('')
  })

  it('clearDraft D removes the draft', () => {
    saveDraft(key, itemForm)
    expect(clearDraft(key).ok).toBe(true)
    expect(restoreDraft(key, itemForm)).toBe(itemForm)
  })

  it('restoreDraft E ignores an invalid draft', () => {
    globalThis.localStorage.setItem(key, '{nope')
    expect(restoreDraft(key, itemForm)).toBe(itemForm)
  })

  it('draft F fails loudly but safely when the storage is not available', () => {
    const spies = [
      vi.spyOn(globalThis.localStorage, 'setItem').mockImplementation(() => {
        throw new Error('quota')
      }),
      vi.spyOn(globalThis.localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('blocked')
      }),
      vi.spyOn(globalThis.localStorage, 'getItem').mockImplementation(() => {
        throw new Error('blocked')
      }),
    ]
    expect(saveDraft(key, itemForm).ok).toBe(false)
    expect(clearDraft(key).ok).toBe(false)
    expect(restoreDraft(key, itemForm)).toBe(itemForm)
    for (const spy of spies) spy.mockRestore()
  })

  it('restoreDraft G ignores values with a wrong type', () => {
    globalThis.localStorage.setItem(key, JSON.stringify({ isPrinted: 'yes', name: true }))
    const restored = restoreDraft(key, itemForm)
    expect(restored.fields.name.value).toBe('')
    expect(restored.fields.isPrinted.value).toBe(false)
  })
})
