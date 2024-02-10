import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { signal, useSignalEffect } from '@preact/signals'
import { useRef, useState } from 'preact/hooks'
import { dom, off, on } from 'shuutils'
import { AppForm } from '../components/app-form'
import { AppPageCard } from '../components/app-page-card'
import { defaultImage, delays } from '../constants'
import { formToItem, itemForm, pushItemLocally, pushItemRemotely } from '../utils/item.utils'
import { logger } from '../utils/logger.utils'
import type { Item } from '../utils/parsers.utils'
import { state } from '../utils/state.utils'

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

// eslint-disable-next-line max-statements
export function PageItemAdd ({ ...properties }: { readonly [key: string]: unknown }) {
  logger.debug('PageItemAdd', { properties })
  const [error, setError] = useState('')
  const photoReference = useRef<HTMLImageElement>(null)
  const photo = signal(photoReference)
  type Form = typeof itemForm

  function checkExistingSetError (item: Item) {
    const exists = checkExisting(item)
    logger.debug('checkExistingSetError', { exists, item })
    if (exists.hasSameBarcode) setError('Barcode already exists, please choose another one')
    else if (exists.hasSameReference) setError('Reference already exists, please choose another one')
    else setError('')
    return exists
  }

  async function onSubmit (form: Form) {
    const item = formToItem(form)
    logger.debug('onSubmit', { form, item })
    if (checkExistingSetError(item).isDuplicate) return
    const result = await pushItemRemotely(item)
    const content = result.success ? 'item added successfully' : 'error adding item'
    const type = result.success ? 'success' : 'error'
    if (result.success) {
      item.id = result.output.id
      pushItemLocally(item)
    }
    state.message = { content, delay: delays.seconds, type }
  }

  function handlePhoto (form: Form) {
    const field = form.fields.photo
    if (field.value === '' || !field.isValid) return
    logger.debug('setting photo to', field.value, photo.value.current)
    photo.value.current?.setAttribute('src', field.value)
  }

  function onChange (form: Form) {
    logger.debug('onChange', { form })
    checkExistingSetError(formToItem(form))
    handlePhoto(form)
  }

  useSignalEffect(() => {
    if (photo.value.current === null) throw new Error('photo not found')
    const handler = on('error', () => { onImageError(photo.value.current ?? dom('img')) }, photo.value.current)
    return () => { if (handler !== false) off(handler) }
  })

  return (
    <AppPageCard cardTitle="Add item" icon={AddCircleOutlineIcon} pageCode="item-add" pageTitle="Add Item">
      <div className="flex flex-col">
        <p>Please fill in the form below to add a new item, no worry, you will be able to edit it later if needed ✏️</p>
        <div className="grid grid-cols-3 gap-6">
          <img alt="item visual" ref={photoReference} src={defaultImage} />
          <div className="col-span-2">
            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
            <AppForm error={error} initialForm={itemForm} onChange={onChange} onSubmit={onSubmit} />
          </div>
        </div>
      </div>
    </AppPageCard>
  )
}
