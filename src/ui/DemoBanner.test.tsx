import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DemoBanner from './DemoBanner.tsx'

describe('DemoBanner', () => {
  it('renders nothing in a writable build', () => {
    const { container } = render(<DemoBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the notice in read-only mode', () => {
    vi.stubEnv('VITE_READONLY', 'true')
    render(<DemoBanner />)
    expect(screen.getByText(/read-only demo/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Source' })).toBeInTheDocument()
  })
})
