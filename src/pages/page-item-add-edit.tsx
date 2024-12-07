import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import Button from '@mui/material/Button'
import { signal, useSignalEffect } from '@preact/signals'
import { route } from 'preact-router'
import { useCallback, useRef, useState } from 'preact/hooks'
import { dom, objectSum, off, on } from 'shuutils'
import { AppForm } from '../components/app-form'
import { AppPageCard } from '../components/app-page-card'
import { defaultImage, delays } from '../constants'
import { areItemsEquivalent, formToItem, type itemForm, itemToForm, onItemImageError, pushItem } from '../utils/item.utils'
import { logger } from '../utils/logger.utils'
import type { Item } from '../utils/parsers.utils'
import { state } from '../utils/state.utils'
import { getSuggestions } from '../utils/suggestions.utils'
import { normalizePhotoUrl } from '../utils/url.utils'

function onImageError (image: HTMLImageElement) {
  state.message = { content: 'error loading image, setting default image', delay: delays.seconds, type: 'error' }
  image.setAttribute('src', defaultImage)
}

function checkExisting (item: Item) {
  const hasSameReference = item.reference !== '' && state.items.some(one => one.reference === item.reference)
  const hasSameBarcode = item.barcode !== '' && state.items.some(one => one.barcode === item.barcode)
  const isDuplicate = hasSameBarcode || hasSameReference
  return { hasSameBarcode, hasSameReference, isDuplicate }
}

function getSuggestionId (item?: Item) {
  if (item === undefined) return ''
  if (item.reference.length > 0) return item.reference
  if (item.barcode.length > 0) return item.barcode
  return ''
}

// eslint-disable-next-line max-statements, complexity, max-lines-per-function
export function PageItemAddEdit ({ id = '', isEdit = false }: Readonly<{ id?: string; isEdit?: boolean }>) {
  logger.debug('PageItemAddEdit', { id, isEdit })
  const initialItem = state.items.find(one => one.id === id)
  const [initialSum] = useState(initialItem ? objectSum(initialItem) : 0)
  const initialForm = itemToForm(initialItem)
  const [error, setError] = useState('')
  const [canSubmit, setCanSubmit] = useState(false)
  const [itemId] = useState(initialItem?.id ?? '')
  const [suggestionId, setSuggestionId] = useState(getSuggestionId(initialItem))
  const [suggestions, setSuggestions] = useState({})
  const [lastForm, setLastForm] = useState(initialForm)
  const photoReference = useRef<HTMLImageElement>(null)
  const photo = signal(photoReference)
  type Form = typeof itemForm

  const checkExistingSetError = useCallback((item: Item) => {
    if (isEdit) return { hasSameBarcode: false, hasSameReference: false, isDuplicate: false } // no need to check for duplicates when editing
    const exists = checkExisting(item)
    logger.debug('checkExistingSetError', { exists, item })
    if (exists.hasSameBarcode) setError('Barcode already exists, please choose another one')
    else if (exists.hasSameReference) setError('Reference already exists, please choose another one')
    else setError('')
    return exists
  }, [isEdit])

  const onSubmitSuccess = useCallback((item: Item) => {
    if (!isEdit) { route(`/item/print/${item.id}`); return }
    state.message = { content: 'item updated successfully', delay: delays.second, type: 'success' }
    route(`/item/details/${item.id}`)
  }, [isEdit])

  const onSubmit = useCallback(async () => {
    const item = formToItem(lastForm, itemId)
    logger.debug('onSubmit', { form: lastForm, item })
    if (!isEdit && checkExistingSetError(item).isDuplicate) return
    const result = await pushItem(item)
    if (result.success) { onSubmitSuccess({ ...item, id: result.output.id }); return }
    state.message = { content: `error ${isEdit ? 'updating' : 'adding'} item`, delay: delays.seconds, type: 'error' }
    logger.error('onSubmit failed', result)
  }, [checkExistingSetError, isEdit, lastForm, onSubmitSuccess, itemId])

  const handlePhoto = useCallback((form: Form) => {
    const field = form.fields.photo
    if (field.value === '' || !field.isValid) return
    const finalUrl = normalizePhotoUrl(field.value)
    form.fields.photo.value = finalUrl
    logger.debug('setting photo to', finalUrl, photo.value.current)
    photo.value.current?.setAttribute('src', finalUrl)
  }, [photo.value])

  const findSuggestions = useCallback(async (item: Item) => {
    if (isEdit) return // skip suggestions when editing for now
    const currentId = getSuggestionId(item)
    if (currentId === suggestionId || currentId === '') return
    logger.debug('findSuggestions for', currentId)
    setSuggestionId(currentId)
    setSuggestions(await getSuggestions(currentId)) // 3245676545517
  }, [isEdit, suggestionId])

  const onChange = useCallback((form: Form) => {
    const item = formToItem(form)
    const isDifferent = initialItem ? !areItemsEquivalent(initialItem, item) : true
    const isValid = error === '' && isDifferent && form.isValid
    logger.debug('onChange', { form, initialItem, isDifferent, isValid, item, sumA: initialSum, sumB: objectSum(item) })
    setLastForm(form)
    setCanSubmit(isValid)
    checkExistingSetError(item)
    void findSuggestions(item)
    handlePhoto(form)
  }, [checkExistingSetError, error, findSuggestions, initialItem, initialSum, handlePhoto])

  const onDetails = useCallback(() => { route(`/item/details/${itemId}`) }, [itemId])
  const onPrint = useCallback(() => { route(`/item/print/${itemId}`) }, [itemId])

  useSignalEffect(useCallback(() => {
    if (photo.value.current === null) throw new Error('photo not found')
    const handler = on('error', () => { onImageError(photo.value.current ?? dom('img')) }, photo.value.current)
    return () => { off(handler) }
  }, [photo.value]))

  if (isEdit && initialItem === undefined) return <>Cannot edit, item with id &quot;{id}&quot; not found ;(</>

  return (
    <AppPageCard cardTitle={`${isEdit ? 'Edit' : 'Add'} item`} icon={AddCircleOutlineIcon} pageCode={`item-${isEdit ? 'edit' : 'add'}`} pageTitle={`${isEdit ? 'Edit' : 'Add'} item`}>
      <div class="flex flex-col w-100 max-h-[90%] md:max-h-full mb-20 md:mb-0 overflow-y-auto overflow-x-hidden">
        {Boolean(isEdit) && <p class="text-center">Please fill in the form below to edit the item, you can change any field you want 🔄</p>}
        {!isEdit && <p class="text-center">Please fill in the form below to add a new item, no worry, you will be able to edit it later if needed ✏️</p>}
        {id !== '' && initialForm.fields.reference.value === '' && <p>Here is the keyword you search previously : {id}</p>}
        <div class="grid md:grid-cols-3 gap-6 items-end">
          <img alt="item visual" class="md:max-h-80 md:max-w-80 w-auto" data-id={itemId} onError={onItemImageError} ref={photoReference} src={initialForm.fields.photo.value || defaultImage} />
          <div class="md:col-span-2">
            <AppForm error={error} initialForm={initialForm} onChange={onChange} suggestions={suggestions} />
          </div>
        </div>
        <div class="flex justify-center">
          <Button disabled={!canSubmit} onClick={onSubmit} variant="contained">{isEdit ? 'Save' : 'Create'}</Button>
          <Button disabled={itemId === ''} onClick={onDetails} variant="outlined">View</Button>
          {!isEdit && <Button disabled={itemId === ''} onClick={onPrint} variant="outlined">Print</Button>}
        </div>
      </div>
    </AppPageCard>
  )
}
