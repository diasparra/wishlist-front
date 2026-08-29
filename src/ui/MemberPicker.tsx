import { Button, Card, CardContent, Stack } from '@mui/material'
import { useSession } from '../contexts/SessionContext'
import { useWishlist } from '../contexts/WishlistContext'
import AppBox from '../components/AppBox.tsx'
import AppTitle from '../components/AppTitle.tsx'

export default function MemberPicker() {
  const { setMemberId } = useSession()
  const { members } = useWishlist()

  return (
    <AppBox
      component="section"
      sx={{ display: 'flex', justifyContent: 'center', p: 2 }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <Stack component={CardContent} spacing={2}>
          <AppTitle value="Who are you?" type="subtitle" />
          {members.map((member) => (
            <Button
              key={member.id}
              variant="outlined"
              onClick={() => setMemberId(member.id)}
            >
              {member.name}
            </Button>
          ))}
        </Stack>
      </Card>
    </AppBox>
  )
}
