import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import type { Item } from '../types'

export function AppItemList ({ items }: { readonly items: Item[] }) {
  return (
    <nav aria-label="item list">
      <List>
        {/* @ts-expect-error typings issue */}
        {items.map(item => (
          <ListItem disablePadding key={item.id}>
            {/* @ts-expect-error typings issue */}
            <ListItemButton component="a" href={`/item/${item.id}`}>
              <img alt={item.name} className="mr-4 h-12 w-12 rounded-full" src={item.photo?.[0]?.url ?? ''} />
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </nav>
  )
}
