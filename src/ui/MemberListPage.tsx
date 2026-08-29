import { useMemo, useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { Button, Card, CardContent, Stack, Typography } from '@mui/material'
import { useSession } from '../contexts/SessionContext'
import { useWishlist } from '../contexts/WishlistContext'
import AppBox from '../components/AppBox.tsx'
import AppTitle from '../components/AppTitle.tsx'
import WishForm from './components/WishForm.tsx'
import WishCard from './components/WishCard.tsx'
import type { CreateWishDTO, WishDTO } from '../dto'

export default function MemberListPage() {
  const { memberId: routeMemberId } = useParams()
  const { memberId } = useSession()
  const { members, wishesFor, addWish, updateWish, removeWish, isReadonly } =
    useWishlist()

  const [editing, setEditing] = useState<WishDTO | null>(null)

  const owner = members.find((member) => member.id === routeMemberId)
  const isSelf = Boolean(routeMemberId) && routeMemberId === memberId

  const visible = useMemo(
    () => (routeMemberId ? wishesFor(routeMemberId) : []),
    [routeMemberId, wishesFor],
  )

  function handleAdd(input: CreateWishDTO) {
    addWish(input)
  }

  function handleUpdate(input: CreateWishDTO) {
    if (editing) {
      updateWish({ id: editing.id, ...input })
    }
    setEditing(null)
  }

  return (
    <AppBox
      component="section"
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}
    >
      <Button component={RouterLink} to="/" sx={{ alignSelf: 'flex-start' }}>
        ← Back
      </Button>
      <AppTitle
        value={owner ? `${owner.name}'s wishlist` : 'Wishlist'}
        type="title"
      />

      {isSelf && !isReadonly && (
        <Card>
          <Stack component={CardContent} spacing={2}>
            <AppTitle
              value={editing ? 'Edit wish' : 'Add a wish'}
              type="subtitle"
            />
            <WishForm
              key={editing?.id ?? 'new'}
              memberId={memberId as string}
              initial={editing ?? undefined}
              onSubmit={editing ? handleUpdate : handleAdd}
              onCancel={editing ? () => setEditing(null) : undefined}
            />
          </Stack>
        </Card>
      )}

      {visible.length === 0 ? (
        <Typography variant="body2">No wishes yet.</Typography>
      ) : (
        <Stack spacing={2}>
          {visible.map((wish) => (
            <WishCard
              key={wish.id}
              wish={wish}
              mode={isSelf ? 'owner' : 'guest'}
              onEdit={isSelf && !isReadonly ? setEditing : undefined}
              onDelete={isSelf && !isReadonly ? removeWish : undefined}
            />
          ))}
        </Stack>
      )}
    </AppBox>
  )
}
