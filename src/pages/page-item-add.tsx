import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { AppForm } from '../components/app-form'
import { AppPageCard } from '../components/app-page-card'
import type { Form } from '../utils/forms.utils'
import { itemForm } from '../utils/item.utils'
import { logger } from '../utils/logger.utils'

export function PageItemAdd ({ ...properties }: { readonly [key: string]: unknown }) {
  logger.debug('PageItemAdd', { properties })
  type Form = typeof itemForm

  function onSubmit (form: Form) {
    logger.debug('onSubmit', { form })
  }

  return (
    <AppPageCard cardTitle="Add" icon={AddCircleOutlineIcon} pageCode="item-add" pageTitle="Add Item">
      <div className="flex flex-col">
        <h1>Add Item</h1>
        <p>Please fill in the form below to add a new item, no worry, you will be able to edit it later if needed ✏️</p>
        <AppForm initialForm={itemForm} onSubmit={onSubmit} />
      </div>
    </AppPageCard>
  )
}
