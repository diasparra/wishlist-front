import { type FormEvent, useState } from 'react'
import { Button, MenuItem, Stack, TextField } from '@mui/material'
import { PRIORITIES } from '../../schemas'
import type { CreateWishDTO, Priority, WishDTO } from '../../dto'

interface Props {
  memberId: string
  initial?: WishDTO
  onSubmit: (input: CreateWishDTO) => void
  onCancel?: () => void
}

export default function WishForm({
  memberId,
  initial,
  onSubmit,
  onCancel,
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [url, setUrl] = useState(initial?.url ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [price, setPrice] = useState(initial?.price ?? '')
  const [priority, setPriority] = useState<Priority | ''>(
    initial?.priority ?? '',
  )
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Title is required')
      return
    }
    setError('')

    onSubmit({
      memberId,
      title: trimmedTitle,
      url: url.trim() || undefined,
      notes: notes.trim() || undefined,
      price: price.trim() || undefined,
      priority: priority || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          id="title"
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          error={Boolean(error)}
          helperText={error || ' '}
        />
        <TextField
          id="url"
          label="Link"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />
        <TextField
          id="notes"
          label="Notes"
          multiline
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
        <TextField
          id="price"
          label="Price"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
        />
        <TextField
          id="priority"
          label="Priority"
          select
          value={priority}
          onChange={(event) => setPriority(event.target.value as Priority | '')}
        >
          <MenuItem value="">None</MenuItem>
          {PRIORITIES.map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </TextField>

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
          <Button type="submit" variant="contained">
            Save
          </Button>
          {onCancel && (
            <Button type="button" variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </Stack>
      </Stack>
    </form>
  )
}
