import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import MoreDots from '@mui/icons-material/MoreVert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { route } from 'preact-router'
import { useState } from 'preact/hooks'
import { copyToClipboard } from 'shuutils'
import { deleteItem } from '../utils/item.utils'
import { logger } from '../utils/logger.utils'
import type { Item } from '../utils/parsers.utils'
import { state } from '../utils/state.utils'

// eslint-disable-next-line max-lines-per-function, max-statements
export function AppItemDetailsActions ({ item }: Readonly<{ item: Item }>) {

  logger.info('AppItemDetailsActions', item)

  async function doDelete () {
    logger.info('deleting item', item)
    const result = await deleteItem(item.id)
    const isOk = result.success
    state.message = { content: isOk ? 'Item deleted' : 'Item deletion failed', type: isOk ? 'success' : 'error' }
    if (isOk) globalThis.history.back()
  }

  function doEdit () {
    logger.info('editing item', item)
    route(`/item/edit/${item.id}`)
  }

  async function doClone () {
    const data = { barcode: item.barcode, box: item.box, brand: item.brand, category: item.category, details: item.details, drawer: item.drawer, location: item.location, name: item.name, photo: item.photo?.[0]?.url, price: item.price?.toString(), reference: item.reference, status: item.status }
    logger.info('cloning item', data)
    await copyToClipboard(data)
    route('/item/add')
  }

  // eslint-disable-next-line unicorn/no-null
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null)
  const isOpen = Boolean(anchorElement)
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion
  const handleClick = (event: MouseEvent) => { setAnchorElement(event.currentTarget as HTMLElement | null) }
  // eslint-disable-next-line unicorn/no-null
  const closeMenu = () => { setAnchorElement(null) }
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const openDialog = () => { setIsDialogOpen(true) }
  const closeDialog = () => { setIsDialogOpen(false) }

  return (
    <div>
      <IconButton
        aria-controls={isOpen ? 'basic-menu' : undefined}
        aria-expanded={isOpen ? 'true' : undefined}
        aria-haspopup="true"
        aria-label="more"
        id="basic-button"
        onClick={handleClick}
      >
        <MoreDots />
      </IconButton>
      <Menu
        anchorEl={anchorElement}
        id="basic-menu"
        MenuListProps={{ 'aria-labelledby': 'basic-button' }}
        onClose={closeMenu}
        open={isOpen}
      >
        <MenuItem onClick={doEdit}><ListItemIcon><EditIcon /></ListItemIcon>Edit</MenuItem>
        <MenuItem onClick={doClone}><ListItemIcon><FileCopyIcon /></ListItemIcon>Clone</MenuItem>
        <MenuItem onClick={openDialog}><ListItemIcon><DeleteIcon /></ListItemIcon>Delete</MenuItem>
      </Menu>
      <Dialog
        aria-describedby="alert-dialog-description"
        aria-labelledby="alert-dialog-title"
        onClose={closeDialog}
        open={isDialogOpen}
      >
        <DialogTitle id="alert-dialog-title">
          Delete item ?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            We need to confirm the deletion of this item.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button autoFocus color="error" onClick={doDelete} variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
