import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import {
  Heart, Users, Share2, BarChart2, Shield, Smartphone,
  ArrowRight, CheckCircle2
} from 'lucide-react'

const features = [
  {
    icon: Heart,
    title: 'Gezamenlijk gebed',
    description: 'Leden kunnen gebedsmuren bekijken en voor elkaar bidden, ook zonder account.',
  },
  {
    icon: Share2,
    title: 'Makkelijk delen',
    description: 'Deel de gebedsmuur via een link of QR-code. Iedereen kan deelnemen.',
  },
  {
    icon: BarChart2,
    title: 'Inzichten & rapporten',
    description: 'Bekijk hoe de gemeente betrokken is bij gebed met overzichtelijke statistieken.',
  },
  {
    icon: Users,
    title: 'Team beheer',
    description: 'Voeg coordinatoren toe en beheer gebedsmuur samen met je team.',
  },
  {
    icon: Shield,
    title: 'Privacy-bewust',
    description: 'Verzoeken kunnen openbaar of privé zijn. Jij bepaalt wat gedeeld wordt.',
  },
  {
    icon: Smartphone,
    title: 'Mobiel-vriendelijk',
    description: 'Gebruik SamenBidden op telefoon, tablet of computer — altijd en overal.',
  },
]

const steps = [
  'Registreer je gemeente gratis',
  'Deel de gebedsmuur link met leden',
  'Ontvang en beheer gebedsmuur vanuit je dashboard',
]

export function LandingPage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-background to-blue-50 py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%236B46C1%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-purple-100 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Heart className="h-4 w-4 fill-primary" />
              <span>Gebedsmuur voor gemeenten</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Breng je gemeente{' '}
              <span className="text-primary">samen in gebed</span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              SamenBidden helpt gemeenten om gebedsmuren te beheren, leden te betrekken
              en samen voor elkaar te bidden — op elke plek en elk moment.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="xl" className="gap-2">
                  Gratis beginnen
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="xl" variant="outline">
                  Al een account? Inloggen
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Gemeenten', value: '200+' },
                  { label: 'Gebedsmuren', value: '1.200+' },
                  { label: 'Gebeden', value: '15.000+' },
                  { label: 'Beantwoord', value: '3.400+' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Alles wat je gemeente nodig heeft
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Een eenvoudig maar krachtig platform voor gebed in de gemeente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-purple-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-to-r from-primary to-purple-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Hoe werkt het?
            </h2>
            <p className="text-purple-100 text-lg max-w-xl mx-auto">
              In drie eenvoudige stappen aan de slag.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl mb-4">
                  {i + 1}
                </div>
                <p className="text-white font-medium text-lg">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="bg-purple-50 rounded-3xl p-10">
            <Heart className="h-12 w-12 text-primary mx-auto mb-4 fill-purple-100" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Klaar om samen te bidden?
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Meld je gemeente gratis aan en ontdek hoe SamenBidden gebed in je gemeente versterkt.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {steps.slice(0, 2).map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  {step}
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link to="/register">
                <Button size="xl" className="gap-2">
                  Gratis beginnen
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </Layout>
  )
}
