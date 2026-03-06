import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { KPICard } from '@/components/shared/KPICard'
import { RYGBadge } from '@/components/shared/RYGBadge'
import { AlertCircle, ArrowRight } from 'lucide-react'
import type { RYGStatus } from '@/lib/supabase/types'
import { formatDate } from '@/lib/utils'
import { DEMO_CM_DATA } from '@/lib/demo-data'

export default async function CMHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') redirect('/login')

  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && !user) {
    const { coaches: coachList, escalations, sessionsByCoach } = DEMO_CM_DATA
    const totalCompleted = Object.values(sessionsByCoach).reduce((sum, s) => sum + s.completed, 0)
    const totalNoShows = Object.values(sessionsByCoach).reduce((sum, s) => sum + s.noShow, 0)

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Cluster Manager Dashboard</h1>
          <p className="text-sm text-muted-foreground">Last 30 days</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KPICard label="Coaches" value={coachList.length} />
          <KPICard label="Sessions completed" value={totalCompleted} />
          <KPICard label="No-shows" value={totalNoShows} />
          <KPICard label="Open escalations" value={escalations.length} />
        </div>

        {escalations.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                Needs attention ({escalations.length} open escalations)
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4 space-y-2">
              {escalations.map((esc: any) => (
                <div key={esc.id} className="flex items-center justify-between gap-2">
                  <div className="text-sm text-red-900">
                    <span className="font-medium">{esc.teacher?.name}</span>
                    {' · '}
                    <span className="text-red-700">{esc.trigger_type.replace(/_/g, ' ')}</span>
                    {' · '}
                    <span className="text-red-600 text-xs">Coach: {esc.coach?.name}</span>
                  </div>
                  <span className="text-xs text-red-600">{formatDate(esc.auto_created_at)}</span>
                </div>
              ))}
              <Button asChild variant="outline" size="sm" className="mt-2 border-red-300 text-red-700">
                <Link href="/cm/coaches">View all escalations</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Your coaches</CardTitle>
          </CardHeader>
          <CardContent className="pb-4 space-y-1">
            {coachList.map((coach: any) => {
              const stats = (sessionsByCoach as any)[coach.id] ?? { completed: 0, noShow: 0 }
              return (
                <Link key={coach.id} href={`/cm/coaches/${coach.id}`}>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer">
                    <span className="text-sm font-medium">{coach.name}</span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{stats.completed} done</span>
                      {stats.noShow > 0 && <span className="text-red-600">{stats.noShow} no-shows</span>}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </div>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('cohort_id')
    .eq('id', user.id)
    .single()

  const cohortId = profile?.cohort_id

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [coaches, openEscalations, recentSessions] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, name')
      .eq('role', 'coach')
      .eq('cohort_id', cohortId)
      .order('name'),

    supabase
      .from('escalations')
      .select('id, trigger_type, teacher:teachers(name), coach:profiles(name), auto_created_at')
      .eq('cohort_id', cohortId)
      .eq('status', 'open')
      .order('auto_created_at', { ascending: false })
      .limit(5),

    supabase
      .from('sessions')
      .select('status, coach_id')
      .gte('scheduled_at', thirtyDaysAgo)
      .in('coach_id', (coaches.data ?? []).map((c: any) => c.id)),
  ])

  const coachList = coaches.data ?? []
  const sessions = recentSessions.data ?? []
  const escalations = openEscalations.data ?? []

  const completedCount = sessions.filter((s: any) => s.status === 'completed').length
  const noShowCount = sessions.filter((s: any) => s.status === 'no_show').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Cluster Manager Dashboard</h1>
        <p className="text-sm text-muted-foreground">Last 30 days</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard label="Coaches" value={coachList.length} />
        <KPICard label="Sessions completed" value={completedCount} />
        <KPICard label="No-shows" value={noShowCount} />
        <KPICard label="Open escalations" value={escalations.length} />
      </div>

      {/* Today's attention */}
      {escalations.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              Needs attention ({escalations.length} open escalations)
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 space-y-2">
            {escalations.map((esc: any) => (
              <div key={esc.id} className="flex items-center justify-between gap-2">
                <div className="text-sm text-red-900">
                  <span className="font-medium">{esc.teacher?.name}</span>
                  {' · '}
                  <span className="text-red-700">{esc.trigger_type.replace(/_/g, ' ')}</span>
                  {' · '}
                  <span className="text-red-600 text-xs">Coach: {esc.coach?.name}</span>
                </div>
                <span className="text-xs text-red-600">{formatDate(esc.auto_created_at)}</span>
              </div>
            ))}
            <Button asChild variant="outline" size="sm" className="mt-2 border-red-300 text-red-700">
              <Link href="/cm/coaches">View all escalations</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Coach quick links */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Your coaches</CardTitle>
        </CardHeader>
        <CardContent className="pb-4 space-y-1">
          {coachList.map((coach: any) => {
            const coachSessions = sessions.filter((s: any) => s.coach_id === coach.id)
            const coachCompleted = coachSessions.filter((s: any) => s.status === 'completed').length
            const coachNoShows = coachSessions.filter((s: any) => s.status === 'no_show').length

            return (
              <Link key={coach.id} href={`/cm/coaches/${coach.id}`}>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer">
                  <span className="text-sm font-medium">{coach.name}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{coachCompleted} done</span>
                    {coachNoShows > 0 && <span className="text-red-600">{coachNoShows} no-shows</span>}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
