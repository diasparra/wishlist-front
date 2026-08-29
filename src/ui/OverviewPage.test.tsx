import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import OverviewPage from './OverviewPage.tsx'
import { useSession } from '../contexts/SessionContext'
import { useWishlist } from '../contexts/WishlistContext'
import type { WishDTO } from '../dto'

vi.mock('../contexts/SessionContext', () => ({ useSession: vi.fn() }))
vi.mock('../contexts/WishlistContext', () => ({ useWishlist: vi.fn() }))

const lock = vi.fn()
const clearMember = vi.fn()

const wishes: Record<string, WishDTO[]> = {
  alice: [
    {
      id: 'a1',
      memberId: 'alice',
      title: 'Drill',
      createdAt: '2026-08-01T00:00:00.000Z',
    },
  ],
  bob: [
    {
      id: 'b1',
      memberId: 'bob',
      title: 'Chess',
      createdAt: '2026-08-01T00:00:00.000Z',
      reservedBy: 'alice',
      reservedAt: '2026-08-02T00:00:00.000Z',
    },
    {
      id: 'b2',
      memberId: 'bob',
      title: 'Book',
      createdAt: '2026-08-01T00:00:00.000Z',
      reservedBy: null,
      reservedAt: null,
    },
  ],
}

function setup(isReadonly = false) {
  vi.mocked(useSession).mockReturnValue({
    unlocked: true,
    memberId: 'alice',
    unlock: vi.fn(),
    lock,
    setMemberId: vi.fn(),
    clearMember,
  })
  vi.mocked(useWishlist).mockReturnValue({
    members: [
      { id: 'alice', name: 'Alice' },
      { id: 'bob', name: 'Bob' },
    ],
    currentMember: { id: 'alice', name: 'Alice' },
    isLoading: false,
    isError: false,
    isReadonly,
    wishesFor: (id: string) => wishes[id] ?? [],
    addWish: vi.fn(),
    updateWish: vi.fn(),
    removeWish: vi.fn(),
    reserve: vi.fn(),
    unreserve: vi.fn(),
  })
}

function renderPage() {
  return render(
    <MemoryRouter>
      <OverviewPage />
    </MemoryRouter>,
  )
}

describe('OverviewPage', () => {
  it('renders a card per member with the right link target', () => {
    setup()
    renderPage()

    expect(screen.getByText('Alice (you)')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Edit my list' })).toHaveAttribute(
      'href',
      '/list/alice',
    )
    expect(screen.getByRole('link', { name: 'View list' })).toHaveAttribute(
      'href',
      '/list/bob',
    )
  })

  it('never shows a reservation count on the viewer’s own card', () => {
    setup()
    renderPage()

    // Bob's card (someone else) shows the reserved tally...
    expect(screen.getByText(/2 wishes · 1 reserved/)).toBeInTheDocument()
    // ...Alice's own card just shows the count, no "reserved".
    expect(screen.getByText('1 wish')).toBeInTheDocument()
  })

  it('wires the switch-person and lock actions', () => {
    setup()
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Switch person' }))
    fireEvent.click(screen.getByRole('button', { name: 'Lock' }))
    expect(clearMember).toHaveBeenCalled()
    expect(lock).toHaveBeenCalled()
  })

  it('hides the Lock button in read-only mode', () => {
    setup(true)
    renderPage()

    expect(
      screen.getByRole('button', { name: 'Switch person' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Lock' }),
    ).not.toBeInTheDocument()
  })
})
