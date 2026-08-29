import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RootLayout from './RootLayout.tsx'

vi.mock('../queries', () => ({
  getMembers: vi.fn().mockResolvedValue([]),
  getWishes: vi.fn().mockResolvedValue([]),
  postWish: vi.fn(),
  putWish: vi.fn(),
  deleteWish: vi.fn(),
  reserveWish: vi.fn(),
}))

describe('RootLayout', () => {
  it('renders children inside the provider stack', () => {
    render(
      <RootLayout>
        <p>hello</p>
      </RootLayout>,
    )
    expect(screen.getByText('hello')).toBeInTheDocument()
  })
})
