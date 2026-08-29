import { z } from 'zod'
import {
  CreateWishSchema,
  MemberSchema,
  PrioritySchema,
  ReserveSchema,
  UpdateWishSchema,
  WishSchema,
} from '../schemas'

export type MemberDTO = z.infer<typeof MemberSchema>

export type WishDTO = z.infer<typeof WishSchema>

export type CreateWishDTO = z.infer<typeof CreateWishSchema>

export type UpdateWishDTO = z.infer<typeof UpdateWishSchema>

export type ReserveDTO = z.infer<typeof ReserveSchema>

export type Priority = z.infer<typeof PrioritySchema>
