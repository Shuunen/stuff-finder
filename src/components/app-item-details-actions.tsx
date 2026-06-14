import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import MoreDots from '@mui/icons-material/MoreVert'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useState } from 'react'
import { copyToClipboard } from 'shuutils'
import type { Item } from '../types/item.types'
import { deleteItem } from '../utils/item.utils'
import { logger } from '../utils/logger.utils'
import { navigate } from '../utils/navigation.utils'
import { AppButton } from './app-button'

// oxlint-disable-next-line max-lines-per-function
export function AppItemDetailsActions({ className, item }: Readonly<{ className?: string; item: Item }>) {
  logger.info('AppItemDetailsActions', item)

  async function doDelete() {
    logger.info('deleting item', item)
    const result = await deleteItem(item)
    if (!result.ok) {
      logger.showError('item deletion failed', result.error)
      return
    }
    const noBack = globalThis.history.length === 1
    logger.showSuccess(`item deleted, going ${noBack ? 'home' : 'back'}...`)
    if (noBack) navigate('/')
    else globalThis.history.back()
  }

  function doEdit() {
    logger.info('editing item', item)
    navigate(`/item/edit/${item.$id}`)
  }

  async function doClone() {
    const data = {
      barcode: item.barcode,
      box: item.box,
      brand: item.brand,
      details: item.details,
      drawer: item.drawer.toString(),
      name: item.name,
      photo: item.photos[0],
      price: item.price.toString(),
      reference: item.reference,
      status: item.status,
    }
    logger.info('cloning item', data)
    await copyToClipboard(data)
    navigate('/item/add')
  }

  // oxlint-disable-next-line no-null
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null)
  const isOpen = Boolean(anchorElement)
  const handleClick = (event?: React.MouseEvent<HTMLElement>) => {
    if (!event) return
    setAnchorElement(event.currentTarget)
  }
  const closeMenu = () => {
    // oxlint-disable-next-line no-null
    setAnchorElement(null)
  }
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const openDialog = () => {
    setIsDialogOpen(true)
  }
  const closeDialog = () => {
    setIsDialogOpen(false)
  }

  return (
    <div className={className}>
      <AppButton aria-controls={isOpen ? 'item-actions-menu' : undefined} aria-expanded={isOpen ? 'true' : undefined} aria-haspopup="true" name="more" label="More" onClick={handleClick} endIcon={<MoreDots />} />
      <Menu id="item-actions-menu" anchorEl={anchorElement} onClose={closeMenu} open={isOpen}>
        <MenuItem onClick={doEdit}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={doClone}>
          <ListItemIcon>
            <FileCopyIcon />
          </ListItemIcon>
          Clone
        </MenuItem>
        <MenuItem onClick={openDialog}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
      <Dialog aria-describedby="delete-dialog-description" aria-labelledby="delete-dialog-title" onClose={closeDialog} open={isDialogOpen}>
        <DialogTitle id="delete-dialog-title">Delete item ?</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">We need to confirm the deletion of this item.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <AppButton name="cancel" label="Cancel" onClick={closeDialog} />
          <AppButton name="delete" color="pastel-5" label="Delete" onClick={doDelete} />
        </DialogActions>
      </Dialog>
    </div>
  )
}
