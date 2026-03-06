import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface KPICardProps {
  label: string
  value: string | number
  subtext?: string
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export function KPICard({ label, value, subtext, trend, className }: KPICardProps) {
  return (
    <Card className={cn('border-l-[3px] border-l-primary/50', className)}>
      <CardContent className="pt-5 pb-5 px-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold mt-1.5 tabular-nums tracking-tight">{value}</p>
        {subtext && (
          <p className={cn(
            'text-xs mt-1 font-medium',
            trend === 'up' ? 'text-emerald-600' :
            trend === 'down' ? 'text-red-500' :
            'text-muted-foreground'
          )}>
            {subtext}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
