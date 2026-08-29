import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import WishForm from './WishForm.tsx'
import type { WishDTO } from '../../dto'

describe('WishForm', () => {
  it('blocks submission and shows an error when the title is blank', () => {
    const onSubmit = vi.fn()
    render(<WishForm memberId="alice" onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: '   ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByText('Title is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('emits a trimmed DTO on a valid submit', () => {
    const onSubmit = vi.fn()
    render(<WishForm memberId="alice" onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: '  Bike  ' },
    })
    fireEvent.change(screen.getByLabelText('Link'), {
      target: { value: ' https://example.com/bike ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledWith({
      memberId: 'alice',
      title: 'Bike',
      url: 'https://example.com/bike',
      notes: undefined,
      price: undefined,
      priority: undefined,
    })
  })

  it('pre-fills from an existing wish in edit mode', () => {
    const initial: WishDTO = {
      id: 'w1',
      memberId: 'alice',
      title: 'Camera',
      url: 'https://example.com/cam',
      notes: 'mirrorless',
      price: '500€',
      priority: 'high',
      createdAt: '2026-08-01T00:00:00.000Z',
      reservedBy: null,
      reservedAt: null,
    }
    render(<WishForm memberId="alice" initial={initial} onSubmit={vi.fn()} />)

    expect(screen.getByLabelText('Title')).toHaveValue('Camera')
    expect(screen.getByLabelText('Link')).toHaveValue('https://example.com/cam')
    expect(screen.getByLabelText('Notes')).toHaveValue('mirrorless')
  })

  it('shows a Cancel button only when onCancel is provided', () => {
    const onCancel = vi.fn()
    const { rerender } = render(
      <WishForm memberId="alice" onSubmit={vi.fn()} />,
    )
    expect(
      screen.queryByRole('button', { name: 'Cancel' }),
    ).not.toBeInTheDocument()

    rerender(
      <WishForm memberId="alice" onSubmit={vi.fn()} onCancel={onCancel} />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalled()
  })
})
