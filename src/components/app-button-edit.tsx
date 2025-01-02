import { Edit } from '@mui/icons-material'
import Button from '@mui/material/Button'
import { route } from 'preact-router'
import { useCallback } from 'preact/hooks'
import type { Item } from '../utils/parsers.utils'

export function AppButtonEdit ({ itemId }: Readonly<{ itemId: Item['id'] }>) {

  const editItem = useCallback(() => {
    route(`/item/edit/${itemId}`)
  }, [itemId])

  return (
    <Button
      endIcon={<Edit />}
      onClick={editItem}
      type="button"
      variant="outlined"
    >
      Edit
    </Button>
  )
}
