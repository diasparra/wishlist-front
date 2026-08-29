import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import MemberPicker from './MemberPicker.tsx'
import { useSession } from '../contexts/SessionContext'
import { useWishlist } from '../contexts/WishlistContext'

vi.mock('../contexts/SessionContext', () => ({ useSession: vi.fn() }))
vi.mock('../contexts/WishlistContext', () => ({ useWishlist: vi.fn() }))

const setMemberId = vi.fn()

function setup() {
  vi.mocked(useSession).mockReturnValue({
    unlocked: true,
    memberId: null,
    unlock: vi.fn(),
    lock: vi.fn(),
    setMemberId,
    clearMember: vi.fn(),
  })
  vi.mocked(useWishlist).mockReturnValue({
    members: [
      { id: 'alice', name: 'Alice' },
      { id: 'bob', name: 'Bob' },
    ],
    currentMember: null,
    isLoading: false,
    isError: false,
    isReadonly: false,
    wishesFor: () => [],
    addWish: vi.fn(),
    updateWish: vi.fn(),
    removeWish: vi.fn(),
    reserve: vi.fn(),
    unreserve: vi.fn(),
  })
}

describe('MemberPicker', () => {
  it('renders a button per member and reports the choice', () => {
    setup()
    render(<MemberPicker />)

    expect(screen.getByRole('button', { name: 'Alice' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Bob' }))
    expect(setMemberId).toHaveBeenCalledWith('bob')
  })
})
