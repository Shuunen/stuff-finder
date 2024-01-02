import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { AppPageCard } from '../components/app-page-card'
import { logger } from '../utils/logger.utils'

export function PageItemAdd ({ ...properties }: { readonly [key: string]: unknown }) {
  logger.debug('PageItemAdd', { properties })
  return (
    <AppPageCard cardTitle="Add" icon={AddCircleOutlineIcon} pageCode="item-add" pageTitle="Add Item">
      <div className="flex flex-col">
        <h1>Add Item</h1>
        <p>Please fill in the form below to add a new item, no worry, you will be able to edit it later if needed ✏️</p>
        <form className="flex flex-col">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" type="text" />
        </form>
      </div>
    </AppPageCard>
  )
}
