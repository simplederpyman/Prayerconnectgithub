import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, MessageCircle, Clock, User, Tag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { CategoryBadge } from '@/components/CategoryBadge'
import { StatusBadge } from '@/components/StatusBadge'
import { PriorityBadge } from '@/components/PriorityBadge'
import { Textarea } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import type { PrayerRequest, PrayerComment, PrayerStatus } from '@/lib/types'

export function VerzoekDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [request, setRequest] = useState<PrayerRequest | null>(null)
  const [comments, setComments] = useState<PrayerComment[]>([])
  const [engagementCount, setEngagementCount] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [commentName, setCommentName] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchRequest()
    fetchComments()
    fetchEngagements()
  }, [id])

  const fetchRequest = async () => {
    if (!id) return
    const { data } = await supabase.from('prayer_requests').select('*').eq('id', id).single()
    setRequest(data)
    setLoading(false)
  }

  const fetchComments = async () => {
    if (!id) return
    const { data } = await supabase
      .from('prayer_comments')
      .select('*')
      .eq('request_id', id)
      .order('created_at', { ascending: true })
    setComments(data ?? [])
  }

  const fetchEngagements = async () => {
    if (!id) return
    const { count } = await supabase
      .from('prayer_engagements')
      .select('*', { count: 'exact', head: true })
      .eq('request_id', id)
    setEngagementCount(count ?? 0)
  }

  const handleStatusChange = async (status: PrayerStatus) => {
    if (!id) return
    await supabase.from('prayer_requests').update({ status }).eq('id', id)
    setRequest(prev => prev ? { ...prev, status } : null)
  }

  const handleArchive = async () => {
    await handleStatusChange('gearchiveerd')
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !newComment.trim()) return
    setSubmitting(true)

    await supabase.from('prayer_comments').insert({
      request_id: id,
      author_name: commentName.trim() || 'Anoniem',
      content: newComment.trim(),
    })

    setNewComment('')
    setCommentName('')
    await fetchComments()
    setSubmitting(false)
  }

  if (loading) return <div className="py-10 text-center text-gray-500">Laden...</div>
  if (!request) return (
    <div className="py-10 text-center">
      <p className="text-gray-500">Verzoek niet gevonden</p>
      <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">Terug</Button>
    </div>
  )

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold text-gray-900">Verzoek details</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Main card */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-xl font-semibold text-gray-900">{request.title}</h2>
              <PriorityBadge priority={request.priority} />
            </div>

            {request.description && (
              <p className="text-gray-700 leading-relaxed">{request.description}</p>
            )}

            <div className="flex flex-wrap gap-2">
              <CategoryBadge category={request.category} />
              <StatusBadge status={request.status} />
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 pt-2 border-t border-gray-100">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {request.author_name ?? 'Anoniem'}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {formatDate(request.created_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-primary" />
                {engagementCount} gebeden
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Admin actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Beheeracties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Status wijzigen</label>
              <Select value={request.status} onValueChange={(v) => handleStatusChange(v as PrayerStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_gebed">In gebed</SelectItem>
                  <SelectItem value="beantwoord">Beantwoord</SelectItem>
                  <SelectItem value="gearchiveerd">Gearchiveerd</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleArchive}
              className="text-gray-600"
            >
              Archiveren
            </Button>
          </CardContent>
        </Card>

        {/* Comments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircle className="h-4 w-4" />
              Reacties ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {comments.length > 0 && (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-800">{comment.author_name}</span>
                      <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddComment} className="space-y-3 pt-2 border-t border-gray-100">
              <input
                className="w-full h-9 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Je naam (optioneel)"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
              />
              <Textarea
                placeholder="Schrijf een reactie..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                required
              />
              <Button type="submit" size="sm" disabled={submitting || !newComment.trim()}>
                {submitting ? 'Verzenden...' : 'Reactie plaatsen'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
