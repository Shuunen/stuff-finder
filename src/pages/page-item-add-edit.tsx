import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import SaveIcon from '@mui/icons-material/Save'
import Button from '@mui/material/Button'
import { signal, useSignalEffect } from '@preact/signals'
import { route } from 'preact-router'
import { useCallback, useRef, useState } from 'preact/hooks'
import { Result, dom, objectSum, off, on } from 'shuutils'
import { AppForm } from '../components/app-form'
import { AppPageCard } from '../components/app-page-card'
import { defaultImage } from '../constants'
import type { Item } from '../types/item.types'
import { itemPhotoToImageUrl } from '../utils/database.utils'
import { addItem, areItemsEquivalent, formToItem, type itemForm, itemToForm, updateItem } from '../utils/item.utils'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

function onImageError (image: HTMLImageElement) {
  logger.error('onImageError : error loading image, setting default image')
  logger.showError('error loading image, setting default image')
  image.setAttribute('src', defaultImage)
}

function checkExisting (item: Item) {
  const hasSameReference = item.reference !== '' && state.items.some(one => one.reference === item.reference)
  const hasSameBarcode = item.barcode !== '' && state.items.some(one => one.barcode === item.barcode)
  const isDuplicate = hasSameBarcode || hasSameReference
  return { hasSameBarcode, hasSameReference, isDuplicate }
}

// eslint-disable-next-line max-statements, complexity, max-lines-per-function
export function PageItemAddEdit ({ id = '', isEdit = false }: Readonly<{ id?: string; isEdit?: boolean }>) {
  logger.debug('PageItemAddEdit', { id, isEdit })
  const initialItem = state.items.find(one => one.$id === id)
  const [initialSum] = useState(initialItem ? objectSum(initialItem) : 0)
  const initialForm = itemToForm(initialItem)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [canSubmit, setCanSubmit] = useState(false)
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
    if (!isEdit) { route(`/item/print/${item.$id}`); return }
    logger.showSuccess('item updated successfully')
    route(`/item/details/${item.$id}`)
  }, [isEdit])

  // eslint-disable-next-line max-statements
  const onSubmit = useCallback(async () => {
    const item = formToItem(lastForm)
    logger.debug('onSubmit', { form: lastForm, item })
    if (!isEdit && checkExistingSetError(item).isDuplicate) return
    setIsLoading(true)
    const result = await (isEdit ? updateItem(item) : addItem(item))
    if (result.ok) { onSubmitSuccess({ ...item, $id: result.value.$id }); return }
    logger.showError(`error ${isEdit ? 'updating' : 'adding'} item`)
    logger.error('onSubmit failed', result)
    setIsLoading(false)
  }, [checkExistingSetError, isEdit, lastForm, onSubmitSuccess])

  const handlePhoto = useCallback((form: Form) => {
    const field = form.fields.photo
    if (field.value === '') return Result.ok('photo form field value is empty')
    if (!field.isValid) return Result.error(`photo form field value "${field.value}" is not valid`)
    const url = itemPhotoToImageUrl(field.value)
    form.fields.photo.value = url
    photo.value.current?.setAttribute('src', url)
    return Result.ok(`photo url set to : ${url}`)
  }, [photo.value])

  const onChange = useCallback((form: Form) => {
    const item = formToItem(form)
    const isDifferent = initialItem ? !areItemsEquivalent(initialItem, item) : true
    const isValid = error === '' && isDifferent && form.isValid
    logger.debug('onChange', { form, initialItem, isDifferent, isValid, item, sumA: initialSum, sumB: objectSum(item) })
    setLastForm(form)
    setCanSubmit(isValid)
    checkExistingSetError(item)
    const result = handlePhoto(form)
    logger.debug('handlePhoto', { form, result })
  }, [checkExistingSetError, error, initialItem, initialSum, handlePhoto])

  useSignalEffect(useCallback(() => {
    if (photo.value.current === null) { logger.showError('photo not found'); return () => ({}) }
    const handler = on('error', () => { onImageError(photo.value.current ?? dom('img')) }, photo.value.current)
    return () => { off(handler) }
  }, [photo.value]))

  if (isEdit && initialItem === undefined) return <>Cannot edit, item with id &quot;{id}&quot; not found ;(</>

  return (
    <AppPageCard cardTitle={`${isEdit ? 'Edit' : 'Add'} item`} icon={isEdit ? EditOutlinedIcon : AddCircleOutlineIcon} pageCode={`item-${isEdit ? 'edit' : 'add'}`} pageTitle={`${isEdit ? 'Edit' : 'Add'} item`}>
      <div class="mb-20 flex max-h-[90%] flex-col overflow-y-auto overflow-x-hidden md:mb-0 md:max-h-full">
        {Boolean(isEdit) && <p class="text-center">Please fill in the form below to edit the item, you can change any field you want 🔄</p>}
        {!isEdit && <p class="text-center">Please fill in the form below to add a new item, no worry, you will be able to edit it later if needed ✏️</p>}
        {id !== '' && initialForm.fields.reference.value === '' && <p>Here is the keyword you search previously : {id}</p>}
        <div class="flex flex-col items-end gap-6 md:flex-row">
          <img alt="item visual" class="w-auto justify-self-center p-4 md:max-h-80 md:w-1/3 md:max-w-72" ref={photoReference} src={itemPhotoToImageUrl(initialForm.fields.photo.value)} />
          <div class="w-full place-self-center pr-4 md:pr-0">
            <AppForm error={error} initialForm={initialForm} onChange={onChange} />
          </div>
        </div>
        <div class="flex justify-center">
          <Button
            disabled={!canSubmit}
            loading={isLoading}
            onClick={onSubmit}
            startIcon={<SaveIcon />}
            variant="contained"
          >
            {isEdit ? 'Save' : 'Create'}
          </Button>
        </div>
      </div>
    </AppPageCard>
  )
}
