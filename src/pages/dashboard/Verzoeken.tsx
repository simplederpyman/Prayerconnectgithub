import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ExternalLink, Copy, Share2, CheckCheck } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { PrayerRequestCard } from '@/components/PrayerRequestCard'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Heart } from 'lucide-react'
import { usePrayerRequests } from '@/hooks/usePrayerRequests'
import { useChurch } from '@/hooks/useChurch'
import type { PrayerCategory, PrayerStatus, PrayerPriority } from '@/lib/types'

export function VerzoekenPage() {
  const { church } = useChurch()
  const { requests, loading } = usePrayerRequests(church?.id ?? null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<PrayerCategory | 'alle'>('alle')
  const [statusFilter, setStatusFilter] = useState<PrayerStatus | 'alle'>('alle')
  const [priorityFilter, setPriorityFilter] = useState<PrayerPriority | 'alle'>('alle')
  const [copied, setCopied] = useState(false)

  const wallUrl = church ? `${window.location.origin}/kerk/${church.slug}/gebedsmuur` : ''

  const handleCopy = async () => {
    if (!wallUrl) return
    await navigator.clipboard.writeText(wallUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (!wallUrl) return
    if (navigator.share) {
      await navigator.share({ title: 'Gebedsmuur', url: wallUrl })
    } else {
      handleCopy()
    }
  }

  const filtered = requests.filter((r) => {
    const matchesSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase()) ||
      r.author_name?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'alle' || r.category === categoryFilter
    const matchesStatus = statusFilter === 'alle' || r.status === statusFilter
    const matchesPriority = priorityFilter === 'alle' || r.priority === priorityFilter
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gebedsmuur</h1>
          <p className="text-gray-600 mt-1">{requests.length} verzoeken in totaal</p>
        </div>
        {church && (
          <div className="flex items-center gap-2">
            <a href={wallUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Openen
              </Button>
            </a>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
              {copied ? <CheckCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Gekopieerd!' : 'Kopiëren'}
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              Delen
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Zoeken..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle categorieën</SelectItem>
              <SelectItem value="ziekte">Ziekte</SelectItem>
              <SelectItem value="familie">Familie</SelectItem>
              <SelectItem value="werk">Werk</SelectItem>
              <SelectItem value="geestelijk_leven">Geestelijk leven</SelectItem>
              <SelectItem value="algemeen">Algemeen</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle statussen</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_gebed">In gebed</SelectItem>
              <SelectItem value="beantwoord">Beantwoord</SelectItem>
              <SelectItem value="gearchiveerd">Gearchiveerd</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as any)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Prioriteit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle prioriteiten</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="normaal">Normaal</SelectItem>
              <SelectItem value="laag">Laag</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Laden...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">Geen verzoeken gevonden</p>
            {search && (
              <p className="text-sm text-gray-400 mt-1">Probeer een andere zoekterm</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <Link key={req.id} to={`/dashboard/verzoek/${req.id}`}>
              <PrayerRequestCard request={req} showAdminActions />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
