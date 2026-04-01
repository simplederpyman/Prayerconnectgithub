export interface Church {
  id: string
  name: string
  slug: string
  location: string | null
  denomination: string | null
  logo_url: string | null
  primary_color: string
  owner_id: string | null
  auto_archive_days: number
  approval_required: boolean
  created_at: string
}

export interface ChurchMember {
  id: string
  church_id: string
  user_id: string
  role: 'admin' | 'coordinator' | 'member'
}

export type PrayerCategory = 'ziekte' | 'familie' | 'werk' | 'geestelijk_leven' | 'algemeen'
export type PrayerPriority = 'urgent' | 'normaal' | 'laag'
export type PrayerVisibility = 'openbaar' | 'prive'
export type PrayerStatus = 'open' | 'in_gebed' | 'beantwoord' | 'gearchiveerd'

export interface PrayerRequest {
  id: string
  church_id: string
  author_name: string | null
  author_id: string | null
  title: string
  description: string | null
  category: PrayerCategory
  priority: PrayerPriority
  visibility: PrayerVisibility
  status: PrayerStatus
  created_at: string
  engagement_count?: number
}

export interface PrayerEngagement {
  id: string
  request_id: string
  user_id: string | null
}

export interface PrayerComment {
  id: string
  request_id: string
  author_name: string
  content: string
  created_at: string
}

export interface PrayerEvent {
  id: string
  church_id: string
  title: string
  event_date: string
  created_at: string
}

export interface DashboardStats {
  totalRequests: number
  totalPrayers: number
  activeMembers: number
  answeredRequests: number
}
