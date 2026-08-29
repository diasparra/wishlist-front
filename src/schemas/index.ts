import { z } from 'zod'

export const PRIORITIES = ['low', 'medium', 'high'] as const

export const PrioritySchema = z.enum(PRIORITIES)

export const MemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  birthday: z.string().optional(), // MM-DD
})

export const WishSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  title: z.string(),
  url: z.string().optional(),
  notes: z.string().optional(),
  price: z.string().optional(),
  priority: PrioritySchema.optional(),
  createdAt: z.string(),
  reservedBy: z.string().nullable().optional(),
  reservedAt: z.string().nullable().optional(),
})

// Accepts a real URL, an empty string (optional field left blank), or nothing.
const OptionalUrl = z.union([z.url(), z.literal('')]).optional()

export const CreateWishSchema = z.object({
  memberId: z.string(),
  title: z.string().min(1),
  url: OptionalUrl,
  notes: z.string().optional(),
  price: z.string().optional(),
  priority: PrioritySchema.optional(),
})

export const UpdateWishSchema = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  url: OptionalUrl,
  notes: z.string().optional(),
  price: z.string().optional(),
  priority: PrioritySchema.optional(),
})

export const ReserveSchema = z.object({
  id: z.string(),
  reservedBy: z.string().nullable(),
})
