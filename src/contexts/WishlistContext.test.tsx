import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WishlistContext, useWishlist } from './WishlistContext.tsx'

function Consumer() {
  const { members } = useWishlist()
  return <span>{members.length}</span>
}

describe('useWishlist', () => {
  it('throws when used outside of a WishlistProvider', () => {
    expect(() => render(<Consumer />)).toThrow(
      'useWishlist must be used within a WishlistProvider',
    )
  })

  it('returns the provided context value', () => {
    render(
      <WishlistContext.Provider
        value={{
          members: [{ id: 'a', name: 'Alice' }],
          currentMember: null,
          isLoading: false,
          isError: false,
          isReadonly: false,
          wishesFor: () => [],
          addWish: () => {},
          updateWish: () => {},
          removeWish: () => {},
          reserve: () => {},
          unreserve: () => {},
        }}
      >
        <Consumer />
      </WishlistContext.Provider>,
    )
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
