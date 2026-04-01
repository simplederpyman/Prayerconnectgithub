import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Building2, Palette, Archive, Bell, Copy, Check, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { useChurch } from '@/hooks/useChurch'

export function InstellingenPage() {
  const { church, refetch } = useChurch()
  const [name, setName] = useState('')
  const [denomination, setDenomination] = useState('')
  const [location, setLocation] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#6B46C1')
  const [autoArchiveDays, setAutoArchiveDays] = useState(90)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!church) return
    setName(church.name)
    setDenomination(church.denomination ?? '')
    setLocation(church.location ?? '')
    setPrimaryColor(church.primary_color)
    setAutoArchiveDays(church.auto_archive_days)
  }, [church])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!church) return
    setSaving(true)

    await supabase.from('churches').update({
      name: name.trim(),
      denomination: denomination.trim() || null,
      location: location.trim() || null,
      primary_color: primaryColor,
      auto_archive_days: autoArchiveDays,
    }).eq('id', church.id)

    setSaving(false)
    setSaved(true)
    refetch()
    setTimeout(() => setSaved(false), 3000)
  }

  const wallUrl = church ? `${window.location.origin}/kerk/${church.slug}/gebedsmuur` : ''

  const copyLink = async () => {
    await navigator.clipboard.writeText(wallUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Instellingen</h1>
        <p className="text-gray-600 mt-1">Beheer de instellingen van je gemeente</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Church info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Gemeente informatie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Naam gemeente"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Denominatie"
                placeholder="PKN, Baptisten, Pinkstergemeente..."
                value={denomination}
                onChange={(e) => setDenomination(e.target.value)}
              />
              <Input
                label="Locatie"
                placeholder="Amsterdam"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Branding */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-4 w-4" />
                Huisstijl
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Primaire kleur</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-16 rounded-xl border border-gray-200 cursor-pointer"
                  />
                  <span className="text-sm font-mono text-gray-600">{primaryColor}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Auto archive */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Archive className="h-4 w-4" />
                Auto-archivering
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Automatisch archiveren na (dagen)
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={autoArchiveDays}
                  onChange={(e) => setAutoArchiveDays(Number(e.target.value))}
                  className="w-32 h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-gray-500">
                  Open verzoeken worden automatisch gearchiveerd na {autoArchiveDays} dagen. 
                  Dit vereist een geplande taak in Supabase.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {saved && (
          <div className="bg-green-50 text-green-700 text-sm p-3 rounded-xl">
            ✓ Instellingen opgeslagen
          </div>
        )}

        <Button type="submit" disabled={saving} size="lg">
          {saving ? 'Opslaan...' : 'Instellingen opslaan'}
        </Button>
      </form>

      {/* Share link */}
      {church && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4" />
                Gebedsmuur link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-sm font-mono text-gray-700 break-all">
                  {wallUrl}
                </div>
                <Button variant="outline" size="icon" onClick={copyLink}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="gap-2"
                onClick={() => window.open(wallUrl, '_blank')}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Gebedsmuur openen
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
