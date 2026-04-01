import { Badge } from '@/components/ui/Badge'
import { priorityLabels } from '@/lib/utils'
import type { PrayerPriority } from '@/lib/types'

const priorityColors: Record<PrayerPriority, string> = {
  urgent: 'destructive',
  normaal: 'secondary',
  laag: 'outline',
}

export function PriorityBadge({ priority }: { priority: PrayerPriority }) {
  return (
    <Badge variant={priorityColors[priority] as any}>
      {priorityLabels[priority]}
    </Badge>
  )
}
