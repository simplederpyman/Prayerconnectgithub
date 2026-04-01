import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, UserPlus, Mail, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Switch } from '@/components/ui/Switch'
import { supabase } from '@/lib/supabase'
import { useChurch } from '@/hooks/useChurch'
import type { ChurchMember } from '@/lib/types'

interface MemberWithEmail extends ChurchMember {
  email?: string
}

export function TeamPage() {
  const { church, refetch } = useChurch()
  const [members, setMembers] = useState<MemberWithEmail[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [approvalRequired, setApprovalRequired] = useState(false)

  useEffect(() => {
    if (!church) return
    setApprovalRequired(church.approval_required)
    fetchMembers()
  }, [church])

  const fetchMembers = async () => {
    if (!church) return
    const { data } = await supabase
      .from('church_members')
      .select('*')
      .eq('church_id', church.id)
    setMembers(data ?? [])
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!church || !inviteEmail.trim()) return
    setLoading(true)

    // In a real app, this would send an invitation email
    // For now, simulate by showing success
    await new Promise((resolve) => setTimeout(resolve, 800))
    setInviteEmail('')
    setInviteSuccess(true)
    setLoading(false)
    setTimeout(() => setInviteSuccess(false), 3000)
  }

  const handleToggleApproval = async (checked: boolean) => {
    if (!church) return
    setApprovalRequired(checked)
    await supabase.from('churches').update({ approval_required: checked }).eq('id', church.id)
    refetch()
  }

  const roleLabel: Record<string, string> = {
    admin: 'Beheerder',
    coordinator: 'Coördinator',
    member: 'Lid',
  }

  const roleVariant: Record<string, string> = {
    admin: 'default',
    coordinator: 'info',
    member: 'secondary',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team beheer</h1>
        <p className="text-gray-600 mt-1">Beheer de leden van je gemeente</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members list */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Teamleden ({members.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">Geen leden gevonden</p>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {member.email ?? 'Gebruiker ' + member.user_id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-gray-500">ID: {member.user_id.slice(0, 8)}...</p>
                        </div>
                      </div>
                      <Badge variant={roleVariant[member.role] as any}>
                        {roleLabel[member.role]}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Invite */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="h-4 w-4" />
                Uitnodigen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="space-y-3">
                <Input
                  type="email"
                  label="E-mailadres"
                  placeholder="naam@gemeente.nl"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
                {inviteSuccess && (
                  <div className="text-green-600 text-sm bg-green-50 p-2 rounded-lg">
                    Uitnodiging verstuurd!
                  </div>
                )}
                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  <Mail className="h-4 w-4" />
                  {loading ? 'Verzenden...' : 'Uitnodiging sturen'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4" />
                Instellingen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Goedkeuring vereist</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Verzoeken moeten worden goedgekeurd voor publicatie
                  </p>
                </div>
                <Switch
                  checked={approvalRequired}
                  onCheckedChange={handleToggleApproval}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
