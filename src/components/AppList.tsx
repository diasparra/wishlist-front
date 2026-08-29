import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import type { ReactNode } from 'react'
import { IconButton, ListItemText } from '@mui/material'

export interface AppListItem {
  id: string
  title: ReactNode
  icon?: ReactNode
  disabled?: boolean
  onClick?: (id: string) => void
}

interface Props {
  items: AppListItem[]
}

export default function AppList({ items }: Props) {
  return (
    <List>
      {items.map((item) => (
        <ListItem key={item.id}>
          {item.icon && (
            <IconButton
              disabled={item.disabled}
              onClick={() => item.onClick && item.onClick(item.id)}
            >
              {item.icon}
            </IconButton>
          )}
          <ListItemText primary={item.title} />
        </ListItem>
      ))}
    </List>
  )
}
