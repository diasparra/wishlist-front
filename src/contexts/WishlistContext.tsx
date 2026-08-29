import { createContext, useContext } from 'react'
import type { CreateWishDTO, MemberDTO, UpdateWishDTO, WishDTO } from '../dto'

export interface WishlistContextValue {
  members: MemberDTO[]
  /** The member the current viewer identified as, resolved against `members`. */
  currentMember: MemberDTO | null
  isLoading: boolean
  isError: boolean
  isReadonly: boolean
  /**
   * Wishes owned by `memberId`. When it is the current viewer's own list the
   * `reservedBy` / `reservedAt` fields are stripped so an owner can never see
   * who claimed what on their own list.
   */
  wishesFor: (memberId: string) => WishDTO[]
  addWish: (input: CreateWishDTO) => void
  updateWish: (input: UpdateWishDTO) => void
  removeWish: (id: string) => void
  reserve: (wish: WishDTO) => void
  unreserve: (wish: WishDTO) => void
}

export const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined,
)

export function useWishlist() {
  const context = useContext(WishlistContext)

  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }

  return context
}
