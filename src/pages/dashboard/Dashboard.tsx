import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, List, Users, CheckCircle2, TrendingUp, ArrowRight } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { StatsCard } from '@/components/StatsCard'
import { PrayerRequestCard } from '@/components/PrayerRequestCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { useChurch } from '@/hooks/useChurch'
import type { PrayerRequest } from '@/lib/types'
import { subWeeks, startOfWeek, endOfWeek, format } from 'date-fns'
import { nl } from 'date-fns/locale'

interface WeeklyData {
  week: string
  verzoeken: number
}

export function DashboardPage() {
  const { church } = useChurch()
  const [stats, setStats] = useState({ total: 0, prayers: 0, members: 0, answered: 0 })
  const [recentRequests, setRecentRequests] = useState<PrayerRequest[]>([])
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([])

  useEffect(() => {
    if (!church) return
    fetchStats()
    fetchRecentRequests()
    fetchWeeklyData()
  }, [church])

  const fetchStats = async () => {
    if (!church) return

    const [totalRes, prayersRes, membersRes, answeredRes] = await Promise.all([
      supabase.from('prayer_requests').select('*', { count: 'exact', head: true }).eq('church_id', church.id).neq('status', 'gearchiveerd'),
      supabase.from('prayer_engagements').select('prayer_requests!inner(church_id)', { count: 'exact', head: true }).eq('prayer_requests.church_id', church.id),
      supabase.from('church_members').select('*', { count: 'exact', head: true }).eq('church_id', church.id),
      supabase.from('prayer_requests').select('*', { count: 'exact', head: true }).eq('church_id', church.id).eq('status', 'beantwoord'),
    ])

    setStats({
      total: totalRes.count ?? 0,
      prayers: prayersRes.count ?? 0,
      members: membersRes.count ?? 0,
      answered: answeredRes.count ?? 0,
    })
  }

  const fetchRecentRequests = async () => {
    if (!church) return
    const { data } = await supabase
      .from('prayer_requests')
      .select('*')
      .eq('church_id', church.id)
      .neq('status', 'gearchiveerd')
      .order('created_at', { ascending: false })
      .limit(5)
    setRecentRequests(data ?? [])
  }

  const fetchWeeklyData = async () => {
    if (!church) return
    const weeks: WeeklyData[] = []
    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 })
      const weekEnd = endOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 })
      const { count } = await supabase
        .from('prayer_requests')
        .select('*', { count: 'exact', head: true })
        .eq('church_id', church.id)
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString())

      weeks.push({
        week: format(weekStart, 'dd MMM', { locale: nl }),
        verzoeken: count ?? 0,
      })
    }
    setWeeklyData(weeks)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Goedemorgen! 👋
        </h1>
        {church && (
          <p className="text-gray-600 mt-1">Overzicht van {church.name}</p>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Open verzoeken" value={stats.total} icon={List} color="bg-primary" delay={0} />
        <StatsCard title="Gebeden" value={stats.prayers} icon={Heart} color="bg-gold" delay={0.05} />
        <StatsCard title="Leden" value={stats.members} icon={Users} color="bg-sky-500" delay={0.1} />
        <StatsCard title="Beantwoord" value={stats.answered} icon={CheckCircle2} color="bg-green-500" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Verzoeken per week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="verzoeken"
                    stroke="#6B46C1"
                    strokeWidth={2}
                    dot={{ fill: '#6B46C1', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Snelle acties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/dashboard/nieuw">
                <Button variant="outline" className="w-full justify-between">
                  Nieuw verzoek
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/dashboard/team">
                <Button variant="outline" className="w-full justify-between">
                  Team beheren
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {church && (
                <Link to={`/kerk/${church.slug}/gebedsmuur`} target="_blank">
                  <Button variant="secondary" className="w-full justify-between">
                    Gebedsmuur openen
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              {church && (
                <Link to={`/kerk/${church.slug}/delen`}>
                  <Button variant="secondary" className="w-full justify-between">
                    Gebedsmuur delen
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 text-lg">Recente verzoeken</h2>
          <Link to="/dashboard/verzoeken">
            <Button variant="ghost" size="sm" className="gap-1">
              Alle bekijken
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        {recentRequests.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-gray-500">
              <Heart className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p>Nog geen gebedsmuur</p>
              <Link to="/dashboard/nieuw" className="mt-3 inline-block">
                <Button size="sm">Eerste verzoek toevoegen</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((req) => (
              <Link key={req.id} to={`/dashboard/verzoek/${req.id}`}>
                <PrayerRequestCard request={req} showAdminActions />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
