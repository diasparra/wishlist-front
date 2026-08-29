import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App.tsx'
import { useSession } from './contexts/SessionContext'

vi.mock('./contexts/SessionContext', () => ({ useSession: vi.fn() }))
vi.mock('./ui/GateScreen.tsx', () => ({ default: () => <div>gate</div> }))
vi.mock('./ui/MemberPicker.tsx', () => ({ default: () => <div>picker</div> }))
vi.mock('./ui/OverviewPage.tsx', () => ({ default: () => <div>overview</div> }))
vi.mock('./ui/MemberListPage.tsx', () => ({ default: () => <div>list</div> }))

function mockSession(unlocked: boolean, memberId: string | null) {
  vi.mocked(useSession).mockReturnValue({
    unlocked,
    memberId,
    unlock: vi.fn(),
    lock: vi.fn(),
    setMemberId: vi.fn(),
    clearMember: vi.fn(),
  })
}

describe('App guard order', () => {
  it('shows the gate while locked', () => {
    mockSession(false, 'alice')
    render(<App />)
    expect(screen.getByText('gate')).toBeInTheDocument()
  })

  it('shows the member picker when unlocked without a member', () => {
    mockSession(true, null)
    render(<App />)
    expect(screen.getByText('picker')).toBeInTheDocument()
  })

  it('shows the routed overview when unlocked with a member', () => {
    mockSession(true, 'alice')
    render(<App />)
    expect(screen.getByText('overview')).toBeInTheDocument()
  })
})
