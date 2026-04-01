import { Badge } from '@/components/ui/Badge'
import { categoryLabels } from '@/lib/utils'
import type { PrayerCategory } from '@/lib/types'

const categoryColors: Record<PrayerCategory, string> = {
  ziekte: 'destructive',
  familie: 'info',
  werk: 'warning',
  geestelijk_leven: 'success',
  algemeen: 'secondary',
}

export function CategoryBadge({ category }: { category: PrayerCategory }) {
  return (
    <Badge variant={categoryColors[category] as any}>
      {categoryLabels[category]}
    </Badge>
  )
}
