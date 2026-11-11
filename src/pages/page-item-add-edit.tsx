import SaveIcon from '@mui/icons-material/Save'
import { type Dispatch, type RefObject, type SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { dom, functionReturningVoid, objectSum, off, on, Result } from 'shuutils'
import { AppButton } from '../components/app-button'
import { AppForm } from '../components/app-form'
import { AppPageCard } from '../components/app-page-card'
import { defaultImage } from '../constants'
import type { Item } from '../types/item.types'
import { getImageFromPaste, imageToWebpDataUrl, isImageFetchable } from '../utils/browser.utils'
import { getAppWriteIdFromUrl, itemPhotoToImageUrl } from '../utils/database.utils'
import { clearDraft, getDraftKey, restoreDraft, saveDraft } from '../utils/draft.utils'
import { validateForm } from '../utils/forms.utils'
import { addItem, areItemsEquivalent, formToItem, type itemForm, itemToForm, updateItem } from '../utils/item.utils'
import { logger } from '../utils/logger.utils'
import { navigate } from '../utils/navigation.utils'
import { state } from '../utils/state.utils'

function onImageError(image: HTMLImageElement) {
  logger.error('onImageError : error loading image, setting default image')
  logger.showError('error loading image, setting default image')
  image.setAttribute('src', defaultImage)
}

function checkExisting(item: Item) {
  const hasSameReference = item.reference !== '' && state.items.some(one => one.reference === item.reference)
  const hasSameBarcode = item.barcode !== '' && state.items.some(one => one.barcode === item.barcode)
  const isDuplicate = hasSameBarcode || hasSameReference
  return { hasSameBarcode, hasSameReference, isDuplicate }
}

const fetchCheckDelay = 500

type LastForm = ReturnType<typeof itemToForm>

// an external photo url that cannot be fetched can be displayed but not uploaded
function useIsNotFetchable(photoValue: string) {
  const [notFetchableUrl, setNotFetchableUrl] = useState('')
  useEffect(() => {
    const isExternalUrl = /^https?:\/\//u.test(photoValue) && getAppWriteIdFromUrl(photoValue) === undefined
    if (!isExternalUrl) return functionReturningVoid
    const controller = new globalThis.AbortController()
    async function check() {
      const isFetchable = await isImageFetchable(photoValue, controller.signal)
      if (!isFetchable) setNotFetchableUrl(photoValue)
    }
    const timer = setTimeout(() => void check(), fetchCheckDelay)
    return function cleanupFetchCheck() {
      clearTimeout(timer)
      controller.abort()
    }
  }, [photoValue])
  return photoValue !== '' && notFetchableUrl === photoValue
}

// a draft is kept in the local storage until the item is saved remotely, so a reload does not lose the form
function useDraftForm(draftKey: string, initialItem: Item | undefined) {
  const startForm = useMemo(() => {
    const initialForm = itemToForm(initialItem)
    const restored = restoreDraft(draftKey, initialForm)
    return restored === initialForm ? initialForm : validateForm(restored).updatedForm
  }, [draftKey, initialItem])
  return { draftKey, startForm }
}

type PastedPhoto = Readonly<{ dataUrl: string; fieldValue: string; previousFieldValue: string }>

// handle an image pasted anywhere on the page, the paste stays active only while the photo field is untouched
// the form keeps its own state so changing the photo field from outside (emptied on paste, restored on remove) re-creates it from the last form
function usePastedPhoto({
  error,
  fieldValue,
  photoReference,
  setCanSubmit,
  setLastForm,
}: Readonly<{ error: string; fieldValue: string; photoReference: RefObject<HTMLImageElement | null>; setCanSubmit: (canSubmit: boolean) => void; setLastForm: Dispatch<SetStateAction<LastForm>> }>) {
  const [pasted, setPasted] = useState<PastedPhoto | undefined>(undefined)
  const [formKey, setFormKey] = useState(0)
  const isNotFetchable = useIsNotFetchable(fieldValue)
  const setPhotoField = useCallback(
    (value: string) => {
      setLastForm(form => ({ ...form, fields: { ...form.fields, photo: { ...form.fields.photo, value } } }))
      setFormKey(key => key + 1)
    },
    [setLastForm],
  )
  useEffect(() => {
    async function onPaste(event: ClipboardEvent) {
      const file = getImageFromPaste(event)
      if (file === undefined) return
      event.preventDefault()
      const result = await imageToWebpDataUrl(file)
      if (!result.ok) {
        logger.showError('could not use the pasted image')
        logger.error('onPaste failed', result.error)
        return
      }
      if (fieldValue !== '') setPhotoField('')
      setPasted({ dataUrl: result.value, fieldValue: '', previousFieldValue: fieldValue })
      photoReference.current?.setAttribute('src', result.value)
      setCanSubmit(error === '')
      logger.showSuccess('pasted image will be used as photo')
    }
    const handler = on('paste', event => void onPaste(event as ClipboardEvent), globalThis as unknown as HTMLElement)
    return function cleanupPaste() {
      off(handler)
    }
  }, [error, fieldValue, photoReference, setCanSubmit, setPhotoField])
  const isActive = useCallback((value: string) => pasted?.fieldValue === value, [pasted])
  const remove = useCallback(() => {
    const previous = pasted?.previousFieldValue ?? ''
    setPasted(undefined)
    if (previous !== '') setPhotoField(previous)
    photoReference.current?.setAttribute('src', itemPhotoToImageUrl(previous))
  }, [pasted, photoReference, setPhotoField])
  const activePhoto = isActive(fieldValue) ? pasted?.dataUrl : undefined
  return { activePhoto, formKey, isActive, isNotFetchable, remove }
}

// oxlint-disable-next-line max-lines-per-function
export function PageItemAddEdit({ isEdit = false }: Readonly<{ isEdit?: boolean }>) {
  const { id = '' } = useParams<{ id: string }>()
  logger.debug('PageItemAddEdit', { id, isEdit })
  const initialItem = state.items.find(one => one.$id === id)
  const initialSum = initialItem ? objectSum(initialItem) : 0
  const { draftKey, startForm } = useDraftForm(getDraftKey(isEdit ? id : ''), initialItem)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [canSubmit, setCanSubmit] = useState<boolean>(startForm.isTouched && startForm.isValid)
  const [lastForm, setLastForm] = useState(startForm)
  const photoReference = useRef<HTMLImageElement>(null)
  const paste = usePastedPhoto({ error, fieldValue: lastForm.fields.photo.value, photoReference, setCanSubmit, setLastForm })
  type Form = typeof itemForm

  const checkExistingSetError = useCallback(
    (item: Item) => {
      if (isEdit) return { hasSameBarcode: false, hasSameReference: false, isDuplicate: false } // no need to check for duplicates when editing
      const exists = checkExisting(item)
      logger.debug('checkExistingSetError', { exists, item })
      if (exists.hasSameBarcode) setError('Barcode already exists, please choose another one')
      else if (exists.hasSameReference) setError('Reference already exists, please choose another one')
      else setError('')
      return exists
    },
    [isEdit],
  )

  const onSubmitSuccess = useCallback(
    (item: Item) => {
      if (!isEdit) {
        // the add page is replaced by the item details, so the back button on the print page leads to the created item
        navigate(`/item/details/${item.$id}`, true)
        navigate(`/item/print/${item.$id}`)
        return
      }
      logger.showSuccess('item updated successfully')
      // Go back to the previous page in history instead of navigating to details
      // This preserves the user's navigation flow
      globalThis.history.back()
    },
    [isEdit],
  )

  const onSubmit = useCallback(async () => {
    const formItem = formToItem(lastForm)
    const item = paste.activePhoto === undefined ? formItem : { ...formItem, photos: [paste.activePhoto] }
    logger.debug('onSubmit', { form: lastForm, item })
    if (!isEdit && checkExistingSetError(item).isDuplicate) return
    setIsLoading(true)
    const result = await (isEdit ? updateItem(item) : addItem(item))
    if (result.ok) {
      clearDraft(draftKey)
      onSubmitSuccess({ ...item, $id: result.value.$id })
      return
    }
    logger.showError(`error ${isEdit ? 'updating' : 'adding'} item`)
    logger.error('onSubmit failed', result)
    setIsLoading(false)
  }, [checkExistingSetError, draftKey, isEdit, lastForm, onSubmitSuccess, paste.activePhoto])

  const handlePhoto = useCallback(
    (form: Form) => {
      if (paste.isActive(form.fields.photo.value)) return Result.ok('a pasted photo takes precedence while the photo field is untouched')
      const field = form.fields.photo
      if (field.value === '') return Result.ok('photo form field value is empty')
      if (!field.isValid) return Result.error(`photo form field value "${field.value}" is not valid`)
      const url = itemPhotoToImageUrl(field.value)
      form.fields.photo.value = url
      photoReference.current?.setAttribute('src', url)
      return Result.ok(`photo url set to : ${url}`)
    },
    [paste],
  )

  const onChange = useCallback(
    (form: Form) => {
      const item = formToItem(form)
      const isDifferent = paste.isActive(form.fields.photo.value) || !initialItem || !areItemsEquivalent(initialItem, item)
      const isValid = error === '' && isDifferent && form.isValid
      logger.debug('onChange', {
        form,
        initialItem,
        isDifferent,
        isValid,
        item,
        sumA: initialSum,
        sumB: objectSum(item),
      })
      setLastForm(form)
      saveDraft(draftKey, form)
      setCanSubmit(isValid)
      checkExistingSetError(item)
      const result = handlePhoto(form)
      logger.debug('handlePhoto', { form, result })
    },
    [checkExistingSetError, draftKey, error, initialItem, initialSum, handlePhoto, paste],
  )

  useEffect(() => {
    if (photoReference.current === null) {
      logger.showError('photo not found')
      return functionReturningVoid
    }
    const handler = on(
      'error',
      () => {
        onImageError(photoReference.current ?? dom('img'))
      },
      photoReference.current,
    )
    return function cleanupPhotoErrorHandler() {
      off(handler)
    }
  }, [])

  if (isEdit && initialItem === undefined) return <>Cannot edit, item with id &quot;{id}&quot; not found ;(</>

  return (
    <AppPageCard cardTitle={`${isEdit ? 'Edit' : 'Add'} item`} pageCode={`item-${isEdit ? 'edit' : 'add'}`} pageTitle={`${isEdit ? 'Edit' : 'Add'} item`}>
      <div className="mb-20 flex max-h-[90%] flex-col overflow-x-hidden overflow-y-auto md:mb-0 md:max-h-full">
        {isEdit && <p className="text-center">Please fill in the form below to edit the item, you can change any field you want 🔄</p>}
        {!isEdit && <p className="text-center">Please fill in the form below to add a new item, no worry, you will be able to edit it later if needed ✏️</p>}
        {id !== '' && startForm.fields.reference.value === '' && <p>Here is the keyword you search previously : {id}</p>}
        <div className="flex flex-col items-end gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-1 md:w-1/3 md:max-w-72">
            <img alt="item visual" height={300} width={400} className="w-auto p-4 md:max-h-80" ref={photoReference} src={itemPhotoToImageUrl(startForm.fields.photo.value)} />
            {paste.isNotFetchable && (
              <p className="text-center text-sm text-red-500" data-testid="photo-not-fetchable">
                Image not fetchable, please right click &gt; copy and paste it, or use a fetchable link
              </p>
            )}
            {paste.activePhoto === undefined ? (
              <p className="text-center text-sm opacity-70" data-testid="photo-hint">
                Paste an image (Ctrl+V) or URL
              </p>
            ) : (
              <div className="flex items-center gap-2" data-testid="photo-pasted">
                <span className="text-sm">📋 Pasted image</span>
                <AppButton label="✕ Remove" name="remove pasted photo" onClick={paste.remove} variant="text" />
              </div>
            )}
          </div>
          <div className="w-full place-self-center pr-4 md:pr-0">
            <AppForm error={error} initialForm={lastForm} key={paste.formKey} onChange={onChange} />
          </div>
        </div>
        <div className="flex justify-center p-2">
          <AppButton name="submit" disabled={!canSubmit || paste.isNotFetchable} label={isEdit ? 'Save' : 'Create'} loading={isLoading} onClick={onSubmit} startIcon={<SaveIcon />} />
        </div>
      </div>
    </AppPageCard>
  )
}
