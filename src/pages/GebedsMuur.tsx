import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Plus, X, QrCode, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PrayerRequestCard } from '@/components/PrayerRequestCard'
import { PrayerForm } from '@/components/PrayerForm'
import { QRCodeDisplay } from '@/components/QRCodeDisplay'
import { supabase } from '@/lib/supabase'
import type { Church, PrayerRequest } from '@/lib/types'

export function GebedsMuurPage() {
  const { slug } = useParams<{ slug: string }>()
  const [church, setChurch] = useState<Church | null>(null)
  const [requests, setRequests] = useState<PrayerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set())
  const [notFound, setNotFound] = useState(false)

  const currentUrl = window.location.href

  // Load prayed IDs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('samenbidden_prayed')
    if (stored) {
      try {
        setPrayedIds(new Set(JSON.parse(stored)))
      } catch {}
    }
  }, [])

  const fetchChurchAndRequests = useCallback(async () => {
    if (!slug) return

    const { data: churchData } = await supabase
      .from('churches')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!churchData) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setChurch(churchData)

    const { data: reqData } = await supabase
      .from('prayer_requests')
      .select('*')
      .eq('church_id', churchData.id)
      .eq('visibility', 'openbaar')
      .neq('status', 'gearchiveerd')
      .order('created_at', { ascending: false })

    if (reqData) {
      const withCounts = await Promise.all(
        reqData.map(async (req) => {
          const { count } = await supabase
            .from('prayer_engagements')
            .select('*', { count: 'exact', head: true })
            .eq('request_id', req.id)
          return { ...req, engagement_count: count ?? 0 }
        })
      )
      setRequests(withCounts)
    }
    setLoading(false)
  }, [slug])

  useEffect(() => {
    fetchChurchAndRequests()
  }, [fetchChurchAndRequests])

  // Realtime subscription
  useEffect(() => {
    if (!church) return

    const channel = supabase
      .channel(`prayer_wall_${church.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prayer_requests', filter: `church_id=eq.${church.id}` },
        () => { fetchChurchAndRequests() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [church, fetchChurchAndRequests])

  const handlePray = async (requestId: string) => {
    const newPrayed = new Set(prayedIds)

    if (newPrayed.has(requestId)) {
      return // Already prayed, don't toggle off in public wall
    }

    newPrayed.add(requestId)
    setPrayedIds(newPrayed)
    localStorage.setItem('samenbidden_prayed', JSON.stringify([...newPrayed]))

    await supabase.from('prayer_engagements').insert({
      request_id: requestId,
      user_id: null,
    })

    // Update count in state
    setRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? { ...r, engagement_count: (r.engagement_count ?? 0) + 1 }
          : r
      )
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary animate-pulse mx-auto mb-3" />
          <p className="text-gray-500">Laden...</p>
        </div>
      </div>
    )
  }

  if (notFound || !church) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-700 mb-2">Gemeente niet gevonden</h1>
          <p className="text-gray-500">De gebedsmuur die je zoekt bestaat niet of is niet meer actief.</p>
        </div>
      </div>
    )
  }

  const primaryColor = church.primary_color || '#6B46C1'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {church.logo_url ? (
              <img src={church.logo_url} alt={church.name} className="h-10 w-10 rounded-xl object-cover" />
            ) : (
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <Heart className="h-5 w-5 text-white fill-white" />
              </div>
            )}
            <div>
              <h1 className="font-bold text-gray-900">{church.name}</h1>
              <p className="text-xs text-gray-500">Gebedsmuur</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowQR(!showQR)}
              title="QR Code"
            >
              <QrCode className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchChurchAndRequests}
              title="Vernieuwen"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* QR Code panel */}
        <AnimatePresence>
          {showQR && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card>
                <CardContent className="p-6 flex flex-col items-center gap-4">
                  <div className="flex items-center justify-between w-full">
                    <h3 className="font-semibold text-gray-900">Deel deze gebedsmuur</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowQR(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <QRCodeDisplay url={currentUrl} size={160} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(currentUrl)}
                  >
                    Link kopiëren
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit form */}
        <div className="mb-8">
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Gebedsverzoek indienen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PrayerForm
                      churchId={church.id}
                      onSuccess={() => {
                        setShowForm(false)
                        fetchChurchAndRequests()
                      }}
                      onCancel={() => setShowForm(false)}
                      isPublic
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Button
                  onClick={() => setShowForm(true)}
                  size="lg"
                  className="w-full gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Plus className="h-5 w-5" />
                  Gebedsverzoek indienen
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-gray-700">
            {requests.length} gebedsverzoek{requests.length !== 1 ? 'en' : ''}
          </h2>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Heart className="h-4 w-4 text-primary" />
            <span>
              {requests.reduce((sum, r) => sum + (r.engagement_count ?? 0), 0)} gebeden
            </span>
          </div>
        </div>

        {/* Prayer requests */}
        {requests.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Nog geen gebedsverzoeken</p>
            <p className="text-gray-400 text-sm mt-1">Wees de eerste die een gebedsverzoek indient</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <PrayerRequestCard
                key={request.id}
                request={request}
                onPray={handlePray}
                hasPrayed={prayedIds.has(request.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
