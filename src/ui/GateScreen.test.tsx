import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import GateScreen from './GateScreen.tsx'
import { useSession } from '../contexts/SessionContext'

vi.mock('../contexts/SessionContext', () => ({ useSession: vi.fn() }))

function mockSession(unlock: (password: string) => boolean) {
  vi.mocked(useSession).mockReturnValue({
    unlocked: false,
    memberId: null,
    unlock,
    lock: vi.fn(),
    setMemberId: vi.fn(),
    clearMember: vi.fn(),
  })
}

describe('GateScreen', () => {
  it('passes the typed password to unlock', () => {
    const unlock = vi.fn().mockReturnValue(true)
    mockSession(unlock)
    render(<GateScreen />)

    fireEvent.change(screen.getByLabelText('Family password'), {
      target: { value: 'secret' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Unlock' }))

    expect(unlock).toHaveBeenCalledWith('secret')
  })

  it('shows an error when unlock rejects the password', () => {
    mockSession(vi.fn().mockReturnValue(false))
    render(<GateScreen />)

    fireEvent.click(screen.getByRole('button', { name: 'Unlock' }))
    expect(screen.getByText('Wrong password')).toBeInTheDocument()
  })

  it('shows no error when unlock accepts the password', () => {
    mockSession(vi.fn().mockReturnValue(true))
    render(<GateScreen />)

    fireEvent.click(screen.getByRole('button', { name: 'Unlock' }))
    expect(screen.queryByText('Wrong password')).not.toBeInTheDocument()
  })
})
