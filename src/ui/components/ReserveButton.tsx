import { Button, Chip, Stack } from '@mui/material'
import type { WishDTO } from '../../dto'
import { useSession } from '../../contexts/SessionContext'
import { useWishlist } from '../../contexts/WishlistContext'

interface Props {
  wish: WishDTO
}

export default function ReserveButton({ wish }: Props) {
  const { memberId } = useSession()
  const { members, reserve, unreserve, isReadonly } = useWishlist()

  const reservedByMe = wish.reservedBy != null && wish.reservedBy === memberId
  const reservedByOther =
    wish.reservedBy != null && wish.reservedBy !== memberId

  if (reservedByOther) {
    const name =
      members.find((member) => member.id === wish.reservedBy)?.name ?? 'someone'
    return <Chip size="small" label={`Reserved by ${name}`} />
  }

  if (reservedByMe) {
    return (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Chip size="small" color="primary" label="Reserved by you" />
        <Button
          size="small"
          disabled={isReadonly}
          onClick={() => unreserve(wish)}
        >
          Release
        </Button>
      </Stack>
    )
  }

  return (
    <Button
      size="small"
      variant="outlined"
      disabled={isReadonly}
      onClick={() => reserve(wish)}
    >
      I'll get this
    </Button>
  )
}
