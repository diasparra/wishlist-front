import {
  Card,
  CardContent,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material'
import { Delete, Edit } from '@mui/icons-material'
import type { WishDTO } from '../../dto'
import ReserveButton from './ReserveButton.tsx'

interface Props {
  wish: WishDTO
  mode: 'owner' | 'guest'
  onEdit?: (wish: WishDTO) => void
  onDelete?: (id: string) => void
}

export default function WishCard({ wish, mode, onEdit, onDelete }: Props) {
  return (
    <Card variant="outlined" data-testid="wish-card">
      <Stack component={CardContent} spacing={1}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
        >
          <Typography variant="h6">{wish.title}</Typography>
          {mode === 'owner' && (onEdit || onDelete) && (
            <Stack direction="row">
              <IconButton aria-label="Edit" onClick={() => onEdit?.(wish)}>
                <Edit fontSize="small" />
              </IconButton>
              <IconButton
                aria-label="Delete"
                onClick={() => onDelete?.(wish.id)}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Stack>
          )}
        </Stack>

        {wish.url && (
          <Link href={wish.url} target="_blank" rel="noopener noreferrer">
            {wish.url}
          </Link>
        )}
        {wish.notes && <Typography variant="body2">{wish.notes}</Typography>}
        {wish.price && <Typography variant="body2">{wish.price}</Typography>}

        {mode === 'guest' && <ReserveButton wish={wish} />}
      </Stack>
    </Card>
  )
}
