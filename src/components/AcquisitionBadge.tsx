import { Badge } from '@/components/ui/badge'
import { acquisitionLabels } from '@/labels'
import type { AcquisitionType } from '@/types'
import { cn } from '@/lib/utils'

const styles: Record<AcquisitionType, string> = {
  khatiyan: 'border-transparent bg-emerald-100 text-emerald-800',
  kewala: 'border-transparent bg-orange-100 text-orange-800',
  rashid: 'border-transparent bg-amber-100 text-amber-900',
  other: 'border-transparent bg-slate-100 text-slate-700',
}

export function AcquisitionBadge({ type }: { type: string }) {
  const key = (type in acquisitionLabels ? type : 'other') as AcquisitionType
  return (
    <Badge variant="outline" className={cn(styles[key])}>
      {acquisitionLabels[key]}
    </Badge>
  )
}
