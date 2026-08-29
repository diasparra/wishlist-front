import { type ReactNode, useCallback, useMemo, useState } from 'react'
import { SessionContext } from '../contexts/SessionContext'

const UNLOCK_KEY = 'wishlist.unlocked'
const MEMBER_KEY = 'wishlist.memberId'

// NOTE: this is a client-side gate only. `VITE_FAMILY_PASSWORD` is baked into the
// bundle, so it keeps casual visitors out and nudges family members to the right
// place — it is not real security. The check moves server-side when a real
// backend lands (see the plan's "Deferred: real backend" section).

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string | null): void {
  try {
    if (value === null) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, value)
    }
  } catch {
    // Ignore (private mode / storage disabled).
  }
}

interface Props {
  children: ReactNode
}

// The read-only demo (GitHub Pages) has nothing writable to protect, so it
// skips the password gate entirely and cannot be locked.
const isReadonly = (): boolean => import.meta.env.VITE_READONLY === 'true'

export function SessionProvider({ children }: Props) {
  const [unlocked, setUnlocked] = useState(
    () => isReadonly() || readStorage(UNLOCK_KEY) === '1',
  )
  const [memberId, setMemberIdState] = useState(() => readStorage(MEMBER_KEY))

  const unlock = useCallback((password: string) => {
    if (password === import.meta.env.VITE_FAMILY_PASSWORD) {
      writeStorage(UNLOCK_KEY, '1')
      setUnlocked(true)
      return true
    }
    return false
  }, [])

  const lock = useCallback(() => {
    if (isReadonly()) return
    writeStorage(UNLOCK_KEY, null)
    setUnlocked(false)
  }, [])

  const setMemberId = useCallback((id: string) => {
    writeStorage(MEMBER_KEY, id)
    setMemberIdState(id)
  }, [])

  const clearMember = useCallback(() => {
    writeStorage(MEMBER_KEY, null)
    setMemberIdState(null)
  }, [])

  const value = useMemo(
    () => ({ unlocked, memberId, unlock, lock, setMemberId, clearMember }),
    [unlocked, memberId, unlock, lock, setMemberId, clearMember],
  )

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}
