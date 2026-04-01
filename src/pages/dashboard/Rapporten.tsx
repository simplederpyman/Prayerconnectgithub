import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { useChurch } from '@/hooks/useChurch'
import { categoryLabels, statusLabels } from '@/lib/utils'

const COLORS = ['#6B46C1', '#D69E2E', '#63B3ED', '#48BB78', '#FC8181']

export function RapportenPage() {
  const { church } = useChurch()
  const [categoryData, setCategoryData] = useState<{ name: string; count: number }[]>([])
  const [statusData, setStatusData] = useState<{ name: string; count: number }[]>([])
  const [engagementData, setEngagementData] = useState<{ name: string; gebeden: number }[]>([])

  useEffect(() => {
    if (!church) return
    fetchCategoryData()
    fetchStatusData()
    fetchEngagementData()
  }, [church])

  const fetchCategoryData = async () => {
    if (!church) return
    const categories = ['ziekte', 'familie', 'werk', 'geestelijk_leven', 'algemeen']
    const data = await Promise.all(
      categories.map(async (cat) => {
        const { count } = await supabase
          .from('prayer_requests')
          .select('*', { count: 'exact', head: true })
          .eq('church_id', church.id)
          .eq('category', cat)
        return { name: categoryLabels[cat], count: count ?? 0 }
      })
    )
    setCategoryData(data)
  }

  const fetchStatusData = async () => {
    if (!church) return
    const statuses = ['open', 'in_gebed', 'beantwoord', 'gearchiveerd']
    const data = await Promise.all(
      statuses.map(async (status) => {
        const { count } = await supabase
          .from('prayer_requests')
          .select('*', { count: 'exact', head: true })
          .eq('church_id', church.id)
          .eq('status', status)
        return { name: statusLabels[status], count: count ?? 0 }
      })
    )
    setStatusData(data)
  }

  const fetchEngagementData = async () => {
    if (!church) return
    const { data: requests } = await supabase
      .from('prayer_requests')
      .select('id, title')
      .eq('church_id', church.id)
      .neq('status', 'gearchiveerd')
      .order('created_at', { ascending: false })
      .limit(10)

    if (!requests) return

    const data = await Promise.all(
      requests.map(async (req) => {
        const { count } = await supabase
          .from('prayer_engagements')
          .select('*', { count: 'exact', head: true })
          .eq('request_id', req.id)
        return {
          name: req.title.length > 25 ? req.title.slice(0, 25) + '...' : req.title,
          gebeden: count ?? 0,
        }
      })
    )
    setEngagementData(data.filter((d) => d.gebeden > 0))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rapporten</h1>
        <p className="text-gray-600 mt-1">Inzicht in gebedsmuur activiteit</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category pie chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Verzoeken per categorie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status bar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Verzoeken per status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6B46C1" radius={[6, 6, 0, 0]} name="Verzoeken" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engagement bar chart */}
        {engagementData.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Meest gebeden voor (top 10)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={engagementData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={150} />
                  <Tooltip />
                  <Bar dataKey="gebeden" fill="#D69E2E" radius={[0, 6, 6, 0]} name="Gebeden" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
