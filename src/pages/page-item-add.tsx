import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { signal, useSignalEffect } from '@preact/signals'
import { useRef } from 'preact/hooks'
import { dom, off, on } from 'shuutils'
import { AppForm } from '../components/app-form'
import { AppPageCard } from '../components/app-page-card'
import { defaultImage, delays } from '../constants'
import { itemForm } from '../utils/item.utils'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

function onImageError (image: HTMLImageElement) {
  state.message = { content: 'error loading image, setting default image', delay: delays.seconds, type: 'error' }
  image.setAttribute('src', defaultImage)
}

export function PageItemAdd ({ ...properties }: { readonly [key: string]: unknown }) {
  logger.debug('PageItemAdd', { properties })
  const photoReference = useRef<HTMLImageElement>(null)
  const photo = signal(photoReference)
  type Form = typeof itemForm

  function onSubmit (form: Form) {
    logger.debug('onSubmit', { form })
  }

  function onChange (form: Form) {
    logger.debug('onChange', { form })
    const field = form.fields.photo
    if (field.value === '' || !field.isValid) return
    logger.debug('setting photo to', field.value, photo.value.current)
    photo.value.current?.setAttribute('src', field.value)
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
            <AppForm initialForm={itemForm} onChange={onChange} onSubmit={onSubmit} />
          </div>
        </div>
      </div>
    </AppPageCard>
  )
}
