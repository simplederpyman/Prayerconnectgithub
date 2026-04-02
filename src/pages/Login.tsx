import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { Heart } from 'lucide-react'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (err) {
      setError('Ongeldig e-mailadres of wachtwoord.')
    } else {
      navigate('/dashboard')
    }
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
              <Heart className="h-7 w-7 text-primary fill-purple-200" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welkom terug</h1>
            <p className="text-gray-600 mt-1">Log in bij SamenBidden</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inloggen</CardTitle>
              <CardDescription>Vul je gegevens in om verder te gaan</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? 'Inloggen...' : 'Inloggen'}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600">
                Nog geen account?{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Registreer je gemeente
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  )
}
