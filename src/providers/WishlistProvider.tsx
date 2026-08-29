import { type ReactNode, useCallback, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteWish,
  getMembers,
  getWishes,
  postWish,
  putWish,
  reserveWish,
} from '../queries'
import { WishlistContext } from '../contexts/WishlistContext'
import { useSession } from '../contexts/SessionContext'
import type { WishDTO } from '../dto'

interface Props {
  children: ReactNode
}

export function WishlistProvider({ children }: Props) {
  const queryClient = useQueryClient()
  const { unlocked, memberId } = useSession()
  const isReadonly = import.meta.env.VITE_READONLY === 'true'

  const membersQuery = useQuery({ queryKey: ['members'], queryFn: getMembers })
  const wishesQuery = useQuery({
    queryKey: ['wishes'],
    queryFn: getWishes,
    enabled: unlocked,
  })

  const members = useMemo(() => membersQuery.data ?? [], [membersQuery.data])
  const wishes = useMemo(() => wishesQuery.data ?? [], [wishesQuery.data])

  const invalidateWishes = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['wishes'] }),
    [queryClient],
  )

  const logError = useCallback((error: unknown) => console.error(error), [])

  const addMutation = useMutation({
    mutationFn: postWish,
    onSuccess: invalidateWishes,
    onError: logError,
  })
  const updateMutation = useMutation({
    mutationFn: putWish,
    onSuccess: invalidateWishes,
    onError: logError,
  })
  const removeMutation = useMutation({
    mutationFn: deleteWish,
    onSuccess: invalidateWishes,
    onError: logError,
  })
  const reserveMutation = useMutation({
    mutationFn: reserveWish,
    onSuccess: invalidateWishes,
    onError: logError,
  })

  const wishesFor = useCallback(
    (owner: string): WishDTO[] => {
      const list = wishes.filter((wish) => wish.memberId === owner)

      if (owner === memberId) {
        // The surprise boundary: an owner never sees claims on their own list.
        return list.map((wish) => {
          const copy = { ...wish }
          delete copy.reservedBy
          delete copy.reservedAt
          return copy
        })
      }

      return list
    },
    [wishes, memberId],
  )

  const reserve = useCallback(
    (wish: WishDTO) => {
      if (!memberId) return
      reserveMutation.mutate({ id: wish.id, reservedBy: memberId })
    },
    [memberId, reserveMutation],
  )

  const unreserve = useCallback(
    (wish: WishDTO) => {
      // Only the person who reserved it can release it.
      if (!memberId || wish.reservedBy !== memberId) return
      reserveMutation.mutate({ id: wish.id, reservedBy: null })
    },
    [memberId, reserveMutation],
  )

  const currentMember = useMemo(
    () => members.find((member) => member.id === memberId) ?? null,
    [members, memberId],
  )

  const value = useMemo(
    () => ({
      members,
      currentMember,
      isLoading: membersQuery.isLoading || wishesQuery.isLoading,
      isError: membersQuery.isError || wishesQuery.isError,
      isReadonly,
      wishesFor,
      addWish: addMutation.mutate,
      updateWish: updateMutation.mutate,
      removeWish: removeMutation.mutate,
      reserve,
      unreserve,
    }),
    [
      members,
      currentMember,
      membersQuery.isLoading,
      membersQuery.isError,
      wishesQuery.isLoading,
      wishesQuery.isError,
      isReadonly,
      wishesFor,
      addMutation.mutate,
      updateMutation.mutate,
      removeMutation.mutate,
      reserve,
      unreserve,
    ],
  )

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}
