import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import ReserveButton from './ReserveButton.tsx'
import { useSession } from '../../contexts/SessionContext'
import { useWishlist } from '../../contexts/WishlistContext'
import type { WishDTO } from '../../dto'

vi.mock('../../contexts/SessionContext', () => ({ useSession: vi.fn() }))
vi.mock('../../contexts/WishlistContext', () => ({ useWishlist: vi.fn() }))

const reserve = vi.fn()
const unreserve = vi.fn()

function setup(memberId: string, isReadonly = false) {
  vi.mocked(useSession).mockReturnValue({
    unlocked: true,
    memberId,
    unlock: vi.fn(),
    lock: vi.fn(),
    setMemberId: vi.fn(),
    clearMember: vi.fn(),
  })
  vi.mocked(useWishlist).mockReturnValue({
    members: [
      { id: 'alice', name: 'Alice' },
      { id: 'carol', name: 'Carol' },
    ],
    currentMember: null,
    isLoading: false,
    isError: false,
    isReadonly,
    wishesFor: () => [],
    addWish: vi.fn(),
    updateWish: vi.fn(),
    removeWish: vi.fn(),
    reserve,
    unreserve,
  })
}

const baseWish: WishDTO = {
  id: 'w1',
  memberId: 'bob',
  title: 'Chess set',
  createdAt: '2026-08-01T00:00:00.000Z',
  reservedBy: null,
  reservedAt: null,
}

describe('ReserveButton', () => {
  it('offers to claim a free wish', () => {
    setup('alice')
    render(<ReserveButton wish={baseWish} />)

    fireEvent.click(screen.getByRole('button', { name: "I'll get this" }))
    expect(reserve).toHaveBeenCalledWith(baseWish)
  })

  it('lets the holder release their own claim', () => {
    setup('alice')
    const wish = { ...baseWish, reservedBy: 'alice' }
    render(<ReserveButton wish={wish} />)

    expect(screen.getByText('Reserved by you')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Release' }))
    expect(unreserve).toHaveBeenCalledWith(wish)
  })

  it('shows who holds a claim made by someone else and offers no action', () => {
    setup('alice')
    render(<ReserveButton wish={{ ...baseWish, reservedBy: 'carol' }} />)

    expect(screen.getByText('Reserved by Carol')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('disables the claim action in read-only mode', () => {
    setup('alice', true)
    render(<ReserveButton wish={baseWish} />)
    expect(screen.getByRole('button', { name: "I'll get this" })).toBeDisabled()
  })
})
