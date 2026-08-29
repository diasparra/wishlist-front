import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import MemberListPage from './MemberListPage.tsx'
import { useSession } from '../contexts/SessionContext'
import { useWishlist } from '../contexts/WishlistContext'
import type { WishDTO } from '../dto'

vi.mock('../contexts/SessionContext', () => ({ useSession: vi.fn() }))
vi.mock('../contexts/WishlistContext', () => ({ useWishlist: vi.fn() }))
vi.mock('./components/WishForm.tsx', () => ({
  default: () => <div>wish-form</div>,
}))
vi.mock('./components/WishCard.tsx', () => ({
  default: ({ wish, mode }: { wish: WishDTO; mode: string }) => (
    <div data-testid="wish-card">
      {wish.title} [{mode}]
    </div>
  ),
}))

const bobWishes: WishDTO[] = [
  {
    id: 'b1',
    memberId: 'bob',
    title: 'Chess set',
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'b2',
    memberId: 'bob',
    title: 'Headphones',
    createdAt: '2026-08-01T00:00:00.000Z',
  },
]

function setup(viewerId: string, isReadonly = false) {
  vi.mocked(useSession).mockReturnValue({
    unlocked: true,
    memberId: viewerId,
    unlock: vi.fn(),
    lock: vi.fn(),
    setMemberId: vi.fn(),
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
    isReadonly,
    wishesFor: (id: string) => (id === 'bob' ? bobWishes : []),
    addWish: vi.fn(),
    updateWish: vi.fn(),
    removeWish: vi.fn(),
    reserve: vi.fn(),
    unreserve: vi.fn(),
  })
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/list/:memberId" element={<MemberListPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('MemberListPage', () => {
  it('shows the add form and owner cards on your own list', () => {
    setup('bob')
    renderAt('/list/bob')

    expect(
      screen.getByRole('heading', { name: "Bob's wishlist" }),
    ).toBeInTheDocument()
    expect(screen.getByText('wish-form')).toBeInTheDocument()
    expect(screen.getAllByTestId('wish-card')[0]).toHaveTextContent('[owner]')
  })

  it('hides the form and renders guest cards on someone else’s list', () => {
    setup('alice')
    renderAt('/list/bob')

    expect(screen.queryByText('wish-form')).not.toBeInTheDocument()
    expect(screen.getAllByTestId('wish-card')[0]).toHaveTextContent('[guest]')
  })

  it('hides the add form on your own list in read-only mode', () => {
    setup('bob', true)
    renderAt('/list/bob')

    expect(screen.queryByText('wish-form')).not.toBeInTheDocument()
    expect(screen.getAllByTestId('wish-card')[0]).toHaveTextContent('[owner]')
  })

  it('renders every wish on the list', () => {
    setup('alice')
    renderAt('/list/bob')

    const cards = screen.getAllByTestId('wish-card')
    expect(cards).toHaveLength(2)
    expect(cards[0]).toHaveTextContent('Chess set')
    expect(cards[1]).toHaveTextContent('Headphones')
  })
})
