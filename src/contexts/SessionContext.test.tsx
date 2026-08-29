import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SessionContext, useSession } from './SessionContext.tsx'

function Consumer() {
  const { memberId } = useSession()
  return <span>{memberId ?? 'none'}</span>
}

describe('useSession', () => {
  it('throws when used outside of a SessionProvider', () => {
    expect(() => render(<Consumer />)).toThrow(
      'useSession must be used within a SessionProvider',
    )
  })

  it('returns the provided context value', () => {
    render(
      <SessionContext.Provider
        value={{
          unlocked: true,
          memberId: 'alice',
          unlock: () => true,
          lock: () => {},
          setMemberId: () => {},
          clearMember: () => {},
        }}
      >
        <Consumer />
      </SessionContext.Provider>,
    )
    expect(screen.getByText('alice')).toBeInTheDocument()
  })
})
