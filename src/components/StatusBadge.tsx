import { Badge } from '@/components/ui/Badge'
import { statusLabels } from '@/lib/utils'
import type { PrayerStatus } from '@/lib/types'

const statusColors: Record<PrayerStatus, string> = {
  open: 'outline',
  in_gebed: 'info',
  beantwoord: 'success',
  gearchiveerd: 'secondary',
}

export function StatusBadge({ status }: { status: PrayerStatus }) {
  return (
    <Badge variant={statusColors[status] as any}>
      {statusLabels[status]}
    </Badge>
  )
}
