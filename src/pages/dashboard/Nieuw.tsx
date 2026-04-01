import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { useChurch } from '@/hooks/useChurch'
import { useAuth } from '@/hooks/useAuth'
import type { PrayerCategory, PrayerPriority, PrayerVisibility } from '@/lib/types'

export function NieuwPage() {
  const navigate = useNavigate()
  const { church } = useChurch()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [category, setCategory] = useState<PrayerCategory>('algemeen')
  const [priority, setPriority] = useState<PrayerPriority>('normaal')
  const [visibility, setVisibility] = useState<PrayerVisibility>('openbaar')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!church || !title.trim()) return
    setLoading(true)
    setError('')

    const { error: err } = await supabase.from('prayer_requests').insert({
      church_id: church.id,
      title: title.trim(),
      description: description.trim() || null,
      author_name: authorName.trim() || null,
      author_id: user?.id ?? null,
      category,
      priority,
      visibility,
      status: 'open',
    })

    setLoading(false)
    if (err) {
      setError('Er ging iets mis. Probeer het opnieuw.')
    } else {
      navigate('/dashboard/verzoeken')
    }
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Nieuw gebedsmuur</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Verzoek details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Titel *"
                placeholder="Bijv. Gebed voor mijn familie"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Textarea
                label="Beschrijving"
                placeholder="Geef meer context of achtergrond..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
              <Input
                label="Naam indiener"
                placeholder="Naam of anoniem laten"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Categorie</label>
                  <Select value={category} onValueChange={(v) => setCategory(v as PrayerCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="algemeen">Algemeen</SelectItem>
                      <SelectItem value="ziekte">Ziekte</SelectItem>
                      <SelectItem value="familie">Familie</SelectItem>
                      <SelectItem value="werk">Werk</SelectItem>
                      <SelectItem value="geestelijk_leven">Geestelijk leven</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Prioriteit</label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as PrayerPriority)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normaal">Normaal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="laag">Laag</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Zichtbaarheid</label>
                <Select value={visibility} onValueChange={(v) => setVisibility(v as PrayerVisibility)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openbaar">Openbaar (zichtbaar op gebedsmuur)</SelectItem>
                    <SelectItem value="prive">Privé (alleen voor team)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{error}</div>
              )}

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Annuleren
                </Button>
                <Button type="submit" disabled={loading || !title.trim()}>
                  {loading ? 'Opslaan...' : 'Verzoek opslaan'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
