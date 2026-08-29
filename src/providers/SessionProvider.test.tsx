import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { SessionProvider } from './SessionProvider.tsx'
import { useSession } from '../contexts/SessionContext'

function Harness() {
  const { unlocked, memberId, unlock, lock, setMemberId, clearMember } =
    useSession()
  return (
    <div>
      <span>{unlocked ? 'unlocked' : 'locked'}</span>
      <span>member:{memberId ?? 'none'}</span>
      <button onClick={() => unlock('family')}>good</button>
      <button onClick={() => unlock('bad')}>bad</button>
      <button onClick={lock}>lock</button>
      <button onClick={() => setMemberId('alice')}>pick</button>
      <button onClick={clearMember}>clear</button>
    </div>
  )
}

function renderHarness() {
  return render(
    <SessionProvider>
      <Harness />
    </SessionProvider>,
  )
}

describe('SessionProvider', () => {
  it('starts locked with no member', () => {
    renderHarness()
    expect(screen.getByText('locked')).toBeInTheDocument()
    expect(screen.getByText('member:none')).toBeInTheDocument()
  })

  it('ignores a wrong password and writes nothing', () => {
    renderHarness()
    fireEvent.click(screen.getByText('bad'))
    expect(screen.getByText('locked')).toBeInTheDocument()
    expect(localStorage.getItem('wishlist.unlocked')).toBeNull()
  })

  it('unlocks on the right password and persists it', () => {
    renderHarness()
    fireEvent.click(screen.getByText('good'))
    expect(screen.getByText('unlocked')).toBeInTheDocument()
    expect(localStorage.getItem('wishlist.unlocked')).toBe('1')
  })

  it('persists and clears the chosen member', () => {
    renderHarness()
    fireEvent.click(screen.getByText('pick'))
    expect(screen.getByText('member:alice')).toBeInTheDocument()
    expect(localStorage.getItem('wishlist.memberId')).toBe('alice')

    fireEvent.click(screen.getByText('clear'))
    expect(screen.getByText('member:none')).toBeInTheDocument()
    expect(localStorage.getItem('wishlist.memberId')).toBeNull()
  })

  it('lock() clears the unlocked flag', () => {
    renderHarness()
    fireEvent.click(screen.getByText('good'))
    fireEvent.click(screen.getByText('lock'))
    expect(screen.getByText('locked')).toBeInTheDocument()
    expect(localStorage.getItem('wishlist.unlocked')).toBeNull()
  })

  it('reads pre-existing storage on mount', () => {
    localStorage.setItem('wishlist.unlocked', '1')
    localStorage.setItem('wishlist.memberId', 'bob')
    renderHarness()
    expect(screen.getByText('unlocked')).toBeInTheDocument()
    expect(screen.getByText('member:bob')).toBeInTheDocument()
  })

  it('auto-unlocks in read-only mode without touching storage', () => {
    vi.stubEnv('VITE_READONLY', 'true')
    renderHarness()
    expect(screen.getByText('unlocked')).toBeInTheDocument()
    expect(localStorage.getItem('wishlist.unlocked')).toBeNull()
  })

  it('lock() is a no-op in read-only mode', () => {
    vi.stubEnv('VITE_READONLY', 'true')
    renderHarness()
    fireEvent.click(screen.getByText('lock'))
    expect(screen.getByText('unlocked')).toBeInTheDocument()
  })
})
