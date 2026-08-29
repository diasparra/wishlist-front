import { type FormEvent, useState } from 'react'
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Stack,
  TextField,
} from '@mui/material'
import { useSession } from '../contexts/SessionContext'
import AppBox from '../components/AppBox.tsx'
import AppTitle from '../components/AppTitle.tsx'

export default function GateScreen() {
  const { unlock } = useSession()
  const [error, setError] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const password = String(
      new FormData(event.currentTarget).get('password') ?? '',
    )
    setError(!unlock(password))
  }

  return (
    <AppBox
      component="section"
      sx={{ display: 'flex', justifyContent: 'center', p: 2 }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <form onSubmit={handleSubmit}>
          <Stack component={CardContent} spacing={2}>
            <AppTitle value="Family wishlist" type="subtitle" />
            <TextField
              id="password"
              name="password"
              type="password"
              label="Family password"
              error={error}
              helperText={error ? 'Wrong password' : ' '}
            />
          </Stack>
          <Stack component={CardActions} sx={{ justifyContent: 'center' }}>
            <Button type="submit" variant="contained">
              Unlock
            </Button>
          </Stack>
        </form>
      </Card>
    </AppBox>
  )
}
