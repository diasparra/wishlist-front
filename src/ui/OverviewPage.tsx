import { Link as RouterLink } from 'react-router-dom'
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Stack,
  Typography,
} from '@mui/material'
import { useSession } from '../contexts/SessionContext'
import { useWishlist } from '../contexts/WishlistContext'
import AppBox from '../components/AppBox.tsx'
import AppTitle from '../components/AppTitle.tsx'

export default function OverviewPage() {
  const { memberId, lock, clearMember } = useSession()
  const { members, wishesFor, isReadonly } = useWishlist()

  return (
    <AppBox
      component="section"
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}
    >
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <AppTitle value="Family wishlist" type="title" />
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={clearMember}>
            Switch person
          </Button>
          {!isReadonly && (
            <Button size="small" onClick={lock}>
              Lock
            </Button>
          )}
        </Stack>
      </Stack>

      {members.map((member) => {
        const isSelf = member.id === memberId
        const wishes = wishesFor(member.id)
        const reserved = isSelf
          ? 0
          : wishes.filter((wish) => wish.reservedBy != null).length

        return (
          <Card key={member.id}>
            <Stack component={CardContent} spacing={0.5}>
              <Typography variant="h6">
                {member.name}
                {isSelf ? ' (you)' : ''}
              </Typography>
              <Typography variant="body2">
                {wishes.length} {wishes.length === 1 ? 'wish' : 'wishes'}
                {!isSelf && ` · ${reserved} reserved`}
              </Typography>
            </Stack>
            <CardActions>
              <Button component={RouterLink} to={`/list/${member.id}`}>
                {isSelf ? 'Edit my list' : 'View list'}
              </Button>
            </CardActions>
          </Card>
        )
      })}
    </AppBox>
  )
}
