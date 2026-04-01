import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { PrayerRequest } from '@/lib/types'

export function usePrayerRequests(churchId: string | null) {
  const [requests, setRequests] = useState<PrayerRequest[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRequests = useCallback(async () => {
    if (!churchId) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('prayer_requests')
      .select('*')
      .eq('church_id', churchId)
      .order('created_at', { ascending: false })

    setRequests(data ?? [])
    setLoading(false)
  }, [churchId])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  return { requests, loading, refetch: fetchRequests }
}

export function usePublicPrayerRequests(churchId: string | null) {
  const [requests, setRequests] = useState<PrayerRequest[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRequests = useCallback(async () => {
    if (!churchId) {
      setLoading(false)
      return
    }
    setLoading(true)

    const { data: reqData } = await supabase
      .from('prayer_requests')
      .select('*')
      .eq('church_id', churchId)
      .eq('visibility', 'openbaar')
      .neq('status', 'gearchiveerd')
      .order('created_at', { ascending: false })

    if (!reqData) {
      setLoading(false)
      return
    }

    // Fetch engagement counts
    const requestsWithCounts = await Promise.all(
      reqData.map(async (req) => {
        const { count } = await supabase
          .from('prayer_engagements')
          .select('*', { count: 'exact', head: true })
          .eq('request_id', req.id)
        return { ...req, engagement_count: count ?? 0 }
      })
    )

    setRequests(requestsWithCounts)
    setLoading(false)
  }, [churchId])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  return { requests, loading, refetch: fetchRequests }
}
