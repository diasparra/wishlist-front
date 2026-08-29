import { describe, expect, it } from 'vitest'
import {
  CreateWishSchema,
  MemberSchema,
  ReserveSchema,
  UpdateWishSchema,
  WishSchema,
} from './index.ts'

describe('MemberSchema', () => {
  it('accepts a member with and without a birthday', () => {
    expect(MemberSchema.safeParse({ id: 'a', name: 'Alice' }).success).toBe(
      true,
    )
    expect(
      MemberSchema.safeParse({ id: 'a', name: 'Alice', birthday: '03-14' })
        .success,
    ).toBe(true)
  })

  it('rejects a member without a name', () => {
    expect(MemberSchema.safeParse({ id: 'a' }).success).toBe(false)
  })
})

describe('WishSchema', () => {
  it('accepts a full wish record', () => {
    const result = WishSchema.safeParse({
      id: 'w1',
      memberId: 'a',
      title: 'Drill',
      url: 'https://example.com',
      createdAt: '2026-08-01T00:00:00.000Z',
      reservedBy: null,
      reservedAt: null,
    })
    expect(result.success).toBe(true)
  })

  it('rejects a record missing required fields', () => {
    const result = WishSchema.safeParse({ id: 'w1', title: 'Drill' })
    expect(result.success).toBe(false)
  })
})

describe('CreateWishSchema', () => {
  it('requires a non-empty title', () => {
    expect(
      CreateWishSchema.safeParse({ memberId: 'a', title: '' }).success,
    ).toBe(false)
    expect(CreateWishSchema.safeParse({ memberId: 'a' }).success).toBe(false)
  })

  it('accepts a minimal payload (memberId + title)', () => {
    const result = CreateWishSchema.safeParse({ memberId: 'a', title: 'Drill' })
    expect(result.success).toBe(true)
  })

  it('accepts an empty or absent url but rejects a non-url', () => {
    expect(
      CreateWishSchema.safeParse({ memberId: 'a', title: 'x', url: '' })
        .success,
    ).toBe(true)
    expect(
      CreateWishSchema.safeParse({ memberId: 'a', title: 'x' }).success,
    ).toBe(true)
    expect(
      CreateWishSchema.safeParse({
        memberId: 'a',
        title: 'x',
        url: 'not-a-url',
      }).success,
    ).toBe(false)
  })
})

describe('UpdateWishSchema', () => {
  it('accepts an id-only payload', () => {
    expect(UpdateWishSchema.safeParse({ id: 'w1' }).success).toBe(true)
  })

  it('rejects a payload without an id', () => {
    expect(UpdateWishSchema.safeParse({ title: 'x' }).success).toBe(false)
  })

  it('strips unknown keys such as memberId', () => {
    const result = UpdateWishSchema.safeParse({
      id: 'w1',
      title: 'x',
      memberId: 'a',
    })
    expect(result.success).toBe(true)
    expect(result.data).not.toHaveProperty('memberId')
  })
})

describe('ReserveSchema', () => {
  it('accepts a member id or null for reservedBy', () => {
    expect(ReserveSchema.safeParse({ id: 'w1', reservedBy: 'a' }).success).toBe(
      true,
    )
    expect(
      ReserveSchema.safeParse({ id: 'w1', reservedBy: null }).success,
    ).toBe(true)
  })

  it('rejects a missing reservedBy', () => {
    expect(ReserveSchema.safeParse({ id: 'w1' }).success).toBe(false)
  })
})
