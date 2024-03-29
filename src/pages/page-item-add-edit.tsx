import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import Button from '@mui/material/Button'
import { signal, useSignalEffect } from '@preact/signals'
import { route } from 'preact-router'
import { useRef, useState } from 'preact/hooks'
import { dom, objectSum, off, on } from 'shuutils'
import { AppForm } from '../components/app-form'
import { AppPageCard } from '../components/app-page-card'
import { defaultImage, delays } from '../constants'
import { areItemsEquivalent, formToItem, itemToForm, onItemImageError, pushItem, type itemForm } from '../utils/item.utils'
import { logger } from '../utils/logger.utils'
import type { Item } from '../utils/parsers.utils'
import { state } from '../utils/state.utils'
import { getSuggestions } from '../utils/suggestions.utils'

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

// eslint-disable-next-line max-statements, complexity
export function PageItemAddEdit ({ id = '', isEdit = false }: { readonly id?: string; readonly isEdit?: boolean }) {
  logger.debug('PageItemAddEdit', { id, isEdit })
  const initialItem = state.items.find(one => one.id === id)
  const [initialSum, setBaseSum] = useState(initialItem ? objectSum(initialItem) : 0)
  const initialForm = itemToForm(initialItem)
  const [error, setError] = useState('')
  const [canSubmit, setCanSubmit] = useState(false)
  const [itemId, setItemId] = useState(initialItem?.id ?? '')
  const [suggestionId, setSuggestionId] = useState(getSuggestionId(initialItem))
  const [suggestions, setSuggestions] = useState({})
  const [lastForm, setLastForm] = useState(initialForm)
  const photoReference = useRef<HTMLImageElement>(null)
  const photo = signal(photoReference)
  type Form = typeof itemForm

  function checkExistingSetError (item: Item) {
    if (isEdit) return { hasSameBarcode: false, hasSameReference: false, isDuplicate: false } // no need to check for duplicates when editing
    const exists = checkExisting(item)
    logger.debug('checkExistingSetError', { exists, item })
    if (exists.hasSameBarcode) setError('Barcode already exists, please choose another one')
    else if (exists.hasSameReference) setError('Reference already exists, please choose another one')
    else setError('')
    return exists
  }

  function onSubmitSuccess (item: Item) {
    state.message = { content: `item ${isEdit ? 'updated' : 'added'} successfully`, delay: delays.second, type: 'success' }
    if (isEdit) {
      setBaseSum(objectSum(item))
      setCanSubmit(false)
    } else {
      setItemId(item.id)
      checkExistingSetError(item)
    }
  }

  async function onSubmit (form: Form) {
    const item = formToItem(form, itemId)
    logger.debug('onSubmit', { form, item })
    if (!isEdit && checkExistingSetError(item).isDuplicate) return
    const result = await pushItem(item)
    if (result.success) { onSubmitSuccess({ ...item, id: result.output.id }); return }
    state.message = { content: `error ${isEdit ? 'updating' : 'adding'} item`, delay: delays.seconds, type: 'error' }
    logger.error('onSubmit failed', result)
  }

  function handlePhoto (form: Form) {
    const field = form.fields.photo
    if (field.value === '' || !field.isValid) return
    logger.debug('setting photo to', field.value, photo.value.current)
    photo.value.current?.setAttribute('src', field.value)
  }

  async function findSuggestions (item: Item) {
    if (isEdit) return // skip suggestions when editing for now
    const currentId = getSuggestionId(item)
    if (currentId === suggestionId || currentId === '') return
    logger.debug('findSuggestions for', currentId)
    setSuggestionId(currentId)
    setSuggestions(await getSuggestions(currentId)) // 3245676545517
  }

  function onChange (form: Form) {
    const item = formToItem(form)
    const isDifferent = initialItem ? !areItemsEquivalent(initialItem, item) : true
    const isValid = error === '' && isDifferent && form.isValid
    logger.debug('onChange', { form, initialItem, isDifferent, isValid, item, sumA: initialSum, sumB: objectSum(item) })
    setLastForm(form)
    setCanSubmit(isValid)
    checkExistingSetError(item)
    void findSuggestions(item)
    handlePhoto(form)
  }

  useSignalEffect(() => {
    if (photo.value.current === null) throw new Error('photo not found')
    const handler = on('error', () => { onImageError(photo.value.current ?? dom('img')) }, photo.value.current)
    return () => { if (handler !== false) off(handler) }
  })

  if (isEdit && initialItem === undefined) return <>Cannot edit, item with id &quot;{id}&quot; not found ;(</>

  return (
    <AppPageCard cardTitle={`${isEdit ? 'Edit' : 'Add'} item`} icon={AddCircleOutlineIcon} pageCode={`item-${isEdit ? 'edit' : 'add'}`} pageTitle={`${isEdit ? 'Edit' : 'Add'} item`}>
      <div className="flex flex-col">
        {Boolean(isEdit) && <p>Please fill in the form below to edit the item, you can change any field you want 🔄</p>}
        {!isEdit && <p>Please fill in the form below to add a new item, no worry, you will be able to edit it later if needed ✏️</p>}
        <div className="flex w-full flex-col md:flex-row">{/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <img alt="item visual" className="w-1/2 md:w-1/4" data-id={itemId} onError={onItemImageError} ref={photoReference} src={initialForm.fields.photo.value || defaultImage} />
          <div className="w-full md:w-3/4">
            <AppForm error={error} initialForm={initialForm} onChange={onChange} suggestions={suggestions} />
          </div>
        </div>
        <div className="flex">
          <Button disabled={!canSubmit} onClick={() => { void onSubmit(lastForm) }} variant="contained">{isEdit ? 'Save' : 'Create'}</Button>
          <Button disabled={itemId === ''} onClick={() => { route(`/item/details/${itemId}`) }} variant="outlined">View</Button>
          {!isEdit && <Button disabled={itemId === ''} onClick={() => { route(`/item/print/${itemId}`) }} variant="outlined">Print</Button>}
        </div>
      </div>
    </AppPageCard>
  )
}
