import type { ReactNode } from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WishlistProvider } from './WishlistProvider.tsx'
import { useWishlist } from '../contexts/WishlistContext'
import { SessionContext } from '../contexts/SessionContext'
import {
  deleteWish,
  getMembers,
  getWishes,
  postWish,
  putWish,
  reserveWish,
} from '../queries'
import type { WishDTO } from '../dto'

vi.mock('../queries', () => ({
  getMembers: vi.fn(),
  getWishes: vi.fn(),
  postWish: vi.fn(),
  putWish: vi.fn(),
  deleteWish: vi.fn(),
  reserveWish: vi.fn(),
}))

const members = [
  { id: 'alice', name: 'Alice' },
  { id: 'bob', name: 'Bob' },
]

const wishes: WishDTO[] = [
  {
    id: 'w-alice',
    memberId: 'alice',
    title: 'Drill',
    createdAt: '2026-08-01T00:00:00.000Z',
    reservedBy: 'bob',
    reservedAt: '2026-08-02T00:00:00.000Z',
  },
  {
    id: 'w-bob',
    memberId: 'bob',
    title: 'Chess set',
    createdAt: '2026-08-01T00:00:00.000Z',
    reservedBy: null,
    reservedAt: null,
  },
]

function renderWithSession(memberId: string | null, ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <SessionContext.Provider
        value={{
          unlocked: true,
          memberId,
          unlock: () => true,
          lock: () => {},
          setMemberId: () => {},
          clearMember: () => {},
        }}
      >
        <WishlistProvider>{ui}</WishlistProvider>
      </SessionContext.Provider>
    </QueryClientProvider>,
  )
}

function Consumer({ owner }: { owner: string }) {
  const { wishesFor, addWish, updateWish, removeWish, reserve, unreserve } =
    useWishlist()
  const list = wishesFor(owner)
  return (
    <div>
      <span data-testid="count">{list.length}</span>
      <span data-testid="keys">
        {list.map((wish) => Object.keys(wish).join(',')).join(' | ')}
      </span>
      <button onClick={() => addWish({ memberId: owner, title: 'x' })}>
        add
      </button>
      <button onClick={() => updateWish({ id: 'w-bob', title: 'y' })}>
        update
      </button>
      <button onClick={() => removeWish('w-bob')}>remove</button>
      <button onClick={() => reserve(list[0])}>reserve</button>
      <button onClick={() => unreserve(wishes[0])}>unreserve-alice</button>
      <button onClick={() => unreserve(bobsClaimedByBob())}>
        unreserve-mine
      </button>
    </div>
  )
}

function bobsClaimedByBob(): WishDTO {
  return { ...wishes[1], reservedBy: 'bob' }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getMembers).mockResolvedValue(members)
  vi.mocked(getWishes).mockResolvedValue(wishes)
  vi.mocked(postWish).mockResolvedValue(wishes[0])
  vi.mocked(putWish).mockResolvedValue(wishes[0])
  vi.mocked(deleteWish).mockResolvedValue(undefined)
  vi.mocked(reserveWish).mockResolvedValue(wishes[0])
})

describe('WishlistProvider.wishesFor', () => {
  it('keeps reservation fields when viewing another member’s list', async () => {
    renderWithSession('alice', <Consumer owner="bob" />)
    await waitFor(() =>
      expect(screen.getByTestId('count')).toHaveTextContent('1'),
    )
    expect(screen.getByTestId('keys').textContent).toContain('reservedBy')
  })

  it('strips reservation fields on the viewer’s own list', async () => {
    renderWithSession('alice', <Consumer owner="alice" />)
    await waitFor(() =>
      expect(screen.getByTestId('count')).toHaveTextContent('1'),
    )
    expect(screen.getByTestId('keys').textContent).not.toContain('reservedBy')
    expect(screen.getByTestId('keys').textContent).not.toContain('reservedAt')
  })
})

describe('WishlistProvider mutations', () => {
  it('routes addWish / updateWish / removeWish to the queries', async () => {
    renderWithSession('alice', <Consumer owner="bob" />)
    await waitFor(() =>
      expect(screen.getByTestId('count')).toHaveTextContent('1'),
    )

    fireEvent.click(screen.getByText('add'))
    fireEvent.click(screen.getByText('update'))
    fireEvent.click(screen.getByText('remove'))

    await waitFor(() => expect(postWish).toHaveBeenCalledTimes(1))
    expect(vi.mocked(postWish).mock.calls[0][0]).toEqual({
      memberId: 'bob',
      title: 'x',
    })
    expect(vi.mocked(putWish).mock.calls[0][0]).toEqual({
      id: 'w-bob',
      title: 'y',
    })
    expect(vi.mocked(deleteWish).mock.calls[0][0]).toBe('w-bob')
  })

  it('reserve claims with the current member id', async () => {
    renderWithSession('alice', <Consumer owner="bob" />)
    await waitFor(() =>
      expect(screen.getByTestId('count')).toHaveTextContent('1'),
    )

    fireEvent.click(screen.getByText('reserve'))
    await waitFor(() => expect(reserveWish).toHaveBeenCalledTimes(1))
    expect(vi.mocked(reserveWish).mock.calls[0][0]).toEqual({
      id: 'w-bob',
      reservedBy: 'alice',
    })
  })

  it('unreserve is a no-op unless the current member holds the claim', async () => {
    renderWithSession('alice', <Consumer owner="bob" />)
    await waitFor(() =>
      expect(screen.getByTestId('count')).toHaveTextContent('1'),
    )

    // wishes[0] is reserved by bob, current member is alice -> ignored
    fireEvent.click(screen.getByText('unreserve-alice'))
    expect(reserveWish).not.toHaveBeenCalled()
  })

  it('unreserve releases when the current member holds the claim', async () => {
    renderWithSession('bob', <Consumer owner="alice" />)
    await waitFor(() =>
      expect(screen.getByTestId('count')).toHaveTextContent('1'),
    )

    fireEvent.click(screen.getByText('unreserve-mine'))
    await waitFor(() => expect(reserveWish).toHaveBeenCalledTimes(1))
    expect(vi.mocked(reserveWish).mock.calls[0][0]).toEqual({
      id: 'w-bob',
      reservedBy: null,
    })
  })
})
