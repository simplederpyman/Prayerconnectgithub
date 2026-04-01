import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '@/lib/supabase'
import type { Church } from '@/lib/types'
import { useAuth } from './useAuth'

interface ChurchContextType {
  church: Church | null
  loading: boolean
  refetch: () => void
}

export const ChurchContext = createContext<ChurchContextType>({
  church: null,
  loading: true,
  refetch: () => {},
})

export function useChurch() {
  return useContext(ChurchContext)
}

export function useChurchState(): ChurchContextType {
  const { user } = useAuth()
  const [church, setChurch] = useState<Church | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!user) {
      setChurch(null)
      setLoading(false)
      return
    }

    const fetchChurch = async () => {
      setLoading(true)
      // First try as owner
      const { data: ownedChurch } = await supabase
        .from('churches')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (ownedChurch) {
        setChurch(ownedChurch)
        setLoading(false)
        return
      }

      // Try as member
      const { data: membership } = await supabase
        .from('church_members')
        .select('church_id')
        .eq('user_id', user.id)
        .single()

      if (membership) {
        const { data: memberChurch } = await supabase
          .from('churches')
          .select('*')
          .eq('id', membership.church_id)
          .single()

        setChurch(memberChurch ?? null)
      } else {
        setChurch(null)
      }
      setLoading(false)
    }

    fetchChurch()
  }, [user, tick])

  return { church, loading, refetch: () => setTick(t => t + 1) }
}
