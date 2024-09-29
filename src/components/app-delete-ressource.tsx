import DeleteIcon from '@mui/icons-material/Delete'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import { useCallback, useState } from 'preact/hooks'

export function AppDeleteRessource ({ onDelete }: Readonly<{ onDelete: () => void }>) {

  const [isOpen, setIsOpen] = useState(false)
  const openDialog = useCallback(() => { setIsOpen(true) }, [])
  const closeDialog = useCallback(() => { setIsOpen(false) }, [])
  const doDelete = useCallback(() => { onDelete(); closeDialog() }, [closeDialog, onDelete])

  return (
    <>
      <IconButton aria-label="delete" onClick={openDialog}>
        <DeleteIcon />
      </IconButton>
      <Dialog aria-describedby="alert-dialog-description" aria-labelledby="alert-dialog-title" onClose={closeDialog} open={isOpen}>
        <DialogTitle id="alert-dialog-title">Hold on a minute</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Don&apos;t do something you might regret. Is it really what you want to do ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <div class="mr-2">
            <Button onClick={closeDialog}>Cancel</Button>
            <Button autoFocus onClick={doDelete}>Delete</Button>
          </div>
        </DialogActions>
      </Dialog>
    </>
  )
}
