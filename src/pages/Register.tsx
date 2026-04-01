import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { generateSlug } from '@/lib/utils'
import { Heart, Building2 } from 'lucide-react'

export function RegisterPage() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [churchName, setChurchName] = useState('')
  const [churchSlug, setChurchSlug] = useState('')
  const [denomination, setDenomination] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChurchNameChange = (v: string) => {
    setChurchName(v)
    setChurchSlug(generateSlug(v))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      setStep(2)
      return
    }

    setLoading(true)
    setError('')

    // Create user
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    if (authErr || !authData.user) {
      setError(authErr?.message ?? 'Registratie mislukt.')
      setLoading(false)
      return
    }

    const userId = authData.user.id

    // Create church
    const { data: churchData, error: churchErr } = await supabase
      .from('churches')
      .insert({
        name: churchName,
        slug: churchSlug,
        denomination: denomination || null,
        location: location || null,
        owner_id: userId,
      })
      .select()
      .single()

    if (churchErr || !churchData) {
      setError('Gemeente aanmaken mislukt. Probeer een andere naam.')
      setLoading(false)
      return
    }

    // Create member record
    await supabase.from('church_members').insert({
      church_id: churchData.id,
      user_id: userId,
      role: 'admin',
    })

    setLoading(false)
    navigate('/dashboard')
  }

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-2xl mb-4">
              {step === 1
                ? <Heart className="h-7 w-7 text-primary fill-purple-200" />
                : <Building2 className="h-7 w-7 text-primary" />
              }
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {step === 1 ? 'Maak een account aan' : 'Registreer je gemeente'}
            </h1>
            <p className="text-gray-600 mt-1">
              Stap {step} van 2
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex gap-2 mb-6">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-gray-200'}`}
              />
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{step === 1 ? 'Persoonlijke gegevens' : 'Gemeente informatie'}</CardTitle>
              <CardDescription>
                {step === 1
                  ? 'Maak je persoonlijk account aan'
                  : 'Vertel ons over je gemeente'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {step === 1 ? (
                  <>
                    <Input
                      label="Je naam"
                      placeholder="Jan de Vries"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <Input
                      type="email"
                      label="E-mailadres"
                      placeholder="jij@gemeente.nl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                    <Input
                      type="password"
                      label="Wachtwoord"
                      placeholder="Minimaal 8 tekens"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </>
                ) : (
                  <>
                    <Input
                      label="Naam gemeente"
                      placeholder="Bijv. Sion Gemeente Amsterdam"
                      value={churchName}
                      onChange={(e) => handleChurchNameChange(e.target.value)}
                      required
                    />
                    <Input
                      label="URL slug"
                      placeholder="sion-gemeente-amsterdam"
                      value={churchSlug}
                      onChange={(e) => setChurchSlug(e.target.value)}
                      required
                    />
                    <div className="text-xs text-gray-500 -mt-2 ml-1">
                      Gebedsmuur: /kerk/{churchSlug}/gebedsmuur
                    </div>
                    <Input
                      label="Denominatie (optioneel)"
                      placeholder="PKN, Baptisten, Pinkstergemeente..."
                      value={denomination}
                      onChange={(e) => setDenomination(e.target.value)}
                    />
                    <Input
                      label="Locatie (optioneel)"
                      placeholder="Amsterdam"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </>
                )}

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">
                    {error}
                  </div>
                )}

                <div className="flex gap-2">
                  {step === 2 && (
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Terug
                    </Button>
                  )}
                  <Button type="submit" className="flex-1" size="lg" disabled={loading}>
                    {loading ? 'Bezig...' : step === 1 ? 'Volgende' : 'Gemeente registreren'}
                  </Button>
                </div>
              </form>

              {step === 1 && (
                <div className="mt-6 text-center text-sm text-gray-600">
                  Al een account?{' '}
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    Inloggen
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  )
}
