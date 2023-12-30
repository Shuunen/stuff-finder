import { logger } from '../utils/logger.utils'

export function AppItemAdd ({ ...properties }: { readonly [key: string]: unknown }) {
  logger.debug('AppItemAdd', { properties })
  return (
    <div className="flex flex-col" data-page="item-add">
      <h1>Add Item</h1>
      <form className="flex flex-col gap-6">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" />
        <label htmlFor="description">Description</label>
        <input id="description" name="description" type="text" />
        <label htmlFor="price">Price</label>
        <input id="price" name="price" type="number" />
        <label htmlFor="image">Image</label>
        <input id="image" name="image" type="text" />
        <button type="submit">Add</button>
      </form>
    </div>
  )
}
