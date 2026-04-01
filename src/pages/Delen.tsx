import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Copy, Check, ExternalLink, Code2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { QRCodeDisplay } from '@/components/QRCodeDisplay'
import { supabase } from '@/lib/supabase'
import type { Church } from '@/lib/types'

export function DelenPage() {
  const { slug } = useParams<{ slug: string }>()
  const [church, setChurch] = useState<Church | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const wallUrl = `${window.location.origin}/kerk/${slug}/gebedsmuur`
  const embedCode = `<iframe src="${wallUrl}" width="100%" height="600" frameborder="0" style="border-radius: 16px;"></iframe>`

  useEffect(() => {
    if (!slug) return
    supabase.from('churches').select('*').eq('slug', slug).single()
      .then(({ data }) => setChurch(data))
  }, [slug])

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-2xl mx-auto px-4 flex items-center gap-3">
          <Link to={wallUrl}>
            <Button variant="ghost" size="sm">← Gebedsmuur</Button>
          </Link>
          <div className="h-4 w-px bg-gray-200" />
          {church && (
            <span className="font-semibold text-gray-900">{church.name}</span>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center">
            <Heart className="h-10 w-10 text-primary mx-auto mb-3 fill-purple-100" />
            <h1 className="text-2xl font-bold text-gray-900">Deel de gebedsmuur</h1>
            <p className="text-gray-600 mt-1">
              Nodig gemeenteleden uit om mee te bidden
            </p>
          </div>

          {/* Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ExternalLink className="h-4 w-4" />
                Directe link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-700 break-all font-mono">
                  {wallUrl}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(wallUrl, 'link')}
                >
                  {copied === 'link' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="mt-3">
                <Link to={wallUrl} target="_blank">
                  <Button variant="secondary" size="sm" className="gap-2">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Gebedsmuur openen
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">QR Code</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-4">
              <QRCodeDisplay url={wallUrl} size={200} />
              <p className="text-sm text-gray-500 mt-4 text-center">
                Scan deze code om de gebedsmuur te openen
              </p>
            </CardContent>
          </Card>

          {/* Embed code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Code2 className="h-4 w-4" />
                Insluit code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-3">
                Voeg de gebedsmuur in op je website
              </p>
              <div className="bg-gray-50 rounded-xl p-3 text-xs font-mono text-gray-700 break-all mb-3">
                {embedCode}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(embedCode, 'embed')}
                className="gap-2"
              >
                {copied === 'embed' ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                Code kopiëren
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
