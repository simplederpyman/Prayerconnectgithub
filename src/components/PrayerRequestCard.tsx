import { motion } from 'framer-motion'
import { Heart, Clock, Tag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CategoryBadge } from './CategoryBadge'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import type { PrayerRequest } from '@/lib/types'
import { formatRelativeDate } from '@/lib/utils'

interface PrayerRequestCardProps {
  request: PrayerRequest
  onPray?: (id: string) => void
  hasPrayed?: boolean
  onClick?: () => void
  showAdminActions?: boolean
}

export function PrayerRequestCard({
  request,
  onPray,
  hasPrayed,
  onClick,
  showAdminActions,
}: PrayerRequestCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <CardContent className="p-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-900 leading-snug">{request.title}</h3>
              <PriorityBadge priority={request.priority} />
            </div>

            {request.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{request.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={request.category} />
              {showAdminActions && <StatusBadge status={request.status} />}
            </div>

            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {request.author_name ?? 'Anoniem'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatRelativeDate(request.created_at)}
                </span>
              </div>

              {onPray && (
                <Button
                  size="sm"
                  variant={hasPrayed ? 'secondary' : 'outline'}
                  onClick={(e) => {
                    e.stopPropagation()
                    onPray(request.id)
                  }}
                  className="gap-1.5"
                >
                  <Heart className={`h-3.5 w-3.5 ${hasPrayed ? 'fill-primary' : ''}`} />
                  <span>{request.engagement_count ?? 0}</span>
                  <span>{hasPrayed ? 'Bid mee' : 'Ik bid mee'}</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
