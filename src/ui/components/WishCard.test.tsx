import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import WishCard from './WishCard.tsx'
import type { WishDTO } from '../../dto'

vi.mock('./ReserveButton.tsx', () => ({
  default: () => <div>reserve-button</div>,
}))

const wish: WishDTO = {
  id: 'w1',
  memberId: 'bob',
  title: 'Cordless drill',
  url: 'https://example.com/drill',
  notes: '18V brushless',
  price: '120€',
  createdAt: '2026-08-01T00:00:00.000Z',
  // A stray claim on the object must never surface in owner mode.
  reservedBy: 'carol',
  reservedAt: '2026-08-02T00:00:00.000Z',
}

describe('WishCard', () => {
  it('owner mode shows details, edit/delete, and never a claim', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    render(
      <WishCard wish={wish} mode="owner" onEdit={onEdit} onDelete={onDelete} />,
    )

    expect(
      screen.getByRole('heading', { name: 'Cordless drill' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'https://example.com/drill' }),
    ).toBeInTheDocument()
    expect(screen.getByText('120€')).toBeInTheDocument()
    expect(screen.queryByText('reserve-button')).not.toBeInTheDocument()
    expect(screen.queryByText(/reserved/i)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(onEdit).toHaveBeenCalledWith(wish)
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith('w1')
  })

  it('owner mode with no handlers (read-only) renders no edit/delete', () => {
    render(<WishCard wish={wish} mode="owner" />)

    expect(
      screen.getByRole('heading', { name: 'Cordless drill' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Edit' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('reserve-button')).not.toBeInTheDocument()
  })

  it('guest mode renders the reserve control and no edit/delete', () => {
    render(<WishCard wish={wish} mode="guest" />)

    expect(screen.getByText('reserve-button')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Edit' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument()
  })
})
