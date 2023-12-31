import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { AppPageBottom } from '../components/app-page-bottom'
import { setTitle } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'

export function PageItemAdd ({ ...properties }: { readonly [key: string]: unknown }) {
  logger.debug('PageItemAdd', { properties })
  setTitle('Add Item')
  return (
    <div className="flex flex-col" data-page="item-add">
      <h1>Add Item</h1>
      <form className="flex flex-col">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" />
        <label htmlFor="description">Description</label>
        <input id="description" name="description" type="text" />
        <label htmlFor="price">Price</label>
        <input id="price" name="price" type="number" />
        <label htmlFor="image">Image</label>
        <input id="image" name="image" type="text" />
        <button type="submit">Add</button>
        <AppPageBottom icon={AddCircleOutlineIcon} nextLabel="Add" nextType="submit" />
      </form>
    </div>
  )
}
