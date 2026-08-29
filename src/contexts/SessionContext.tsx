import { createContext, useContext } from 'react'

export interface SessionContextValue {
  /** Family password gate has been passed on this device. */
  unlocked: boolean
  /** Which family member the current viewer said they are. */
  memberId: string | null
  /** Returns true when the password matched. */
  unlock: (password: string) => boolean
  lock: () => void
  setMemberId: (id: string) => void
  clearMember: () => void
}

export const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
)

export function useSession() {
  const context = useContext(SessionContext)

  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }

  return context
}
