import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { supabase } from '@/lib/supabase'
import type { PrayerCategory } from '@/lib/types'

interface PrayerFormProps {
  churchId: string
  onSuccess?: () => void
  onCancel?: () => void
  isPublic?: boolean
}

export function PrayerForm({ churchId, onSuccess, onCancel, isPublic = false }: PrayerFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [category, setCategory] = useState<PrayerCategory>('algemeen')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Vul een titel in')
      return
    }
    setLoading(true)
    setError('')

    const { error: err } = await supabase.from('prayer_requests').insert({
      church_id: churchId,
      title: title.trim(),
      description: description.trim() || null,
      author_name: authorName.trim() || null,
      category,
      visibility: 'openbaar',
      status: 'open',
    })

    setLoading(false)
    if (err) {
      setError('Er ging iets mis. Probeer het opnieuw.')
    } else {
      setTitle('')
      setDescription('')
      setAuthorName('')
      setCategory('algemeen')
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Wat wil je delen? *"
        placeholder="Bijv. Gebed voor mijn zieke moeder..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <Textarea
        label="Meer details (optioneel)"
        placeholder="Meer achtergrond of context..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />

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

      {isPublic && (
        <Input
          label="Naam (optioneel)"
          placeholder="Je naam of anoniem laten"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
        />
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Annuleren
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Verzenden...' : 'Gebed indienen'}
        </Button>
      </div>
    </form>
  )
}
