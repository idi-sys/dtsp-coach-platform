import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function CoachesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('cohort_id')
    .eq('id', user.id)
    .single()

  const { data: coaches } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('role', 'coach')
    .eq('cohort_id', profile?.cohort_id)
    .order('name')

  const coachIds = (coaches ?? []).map((c: any) => c.id)

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [sessions, escalations, assignments] = await Promise.all([
    supabase
      .from('sessions')
      .select('status, coach_id, confirmation_status')
      .in('coach_id', coachIds)
      .gte('scheduled_at', thirtyDaysAgo),

    supabase
      .from('escalations')
      .select('coach_id, status')
      .in('coach_id', coachIds)
      .eq('status', 'open'),

    supabase
      .from('assignments')
      .select('coach_id')
      .in('coach_id', coachIds)
      .eq('is_active', true),
  ])

  const sessionData = sessions.data ?? []
  const escalationData = escalations.data ?? []
  const assignmentData = assignments.data ?? []

  // Sort coaches by urgency (most open escalations first)
  const coachMetrics = (coaches ?? []).map((coach: any) => {
    const coachSessions = sessionData.filter((s: any) => s.coach_id === coach.id)
    const openEsc = escalationData.filter((e: any) => e.coach_id === coach.id).length
    const teacherCount = assignmentData.filter((a: any) => a.coach_id === coach.id).length
    const completed = coachSessions.filter((s: any) => s.status === 'completed').length
    const noShows = coachSessions.filter((s: any) => s.status === 'no_show').length
    const pending = coachSessions.filter((s: any) => s.confirmation_status === 'pending').length

    return { ...coach, openEsc, teacherCount, completed, noShows, pendingConfirmation: pending }
  }).sort((a: any, b: any) => b.openEsc - a.openEsc)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Coach Triage</h1>
        <p className="text-sm text-muted-foreground">Sorted by urgency — most escalations first</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {coachMetrics.map((coach: any) => (
          <Link key={coach.id} href={`/cm/coaches/${coach.id}`}>
            <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">{coach.name}</span>
                  <div className="flex items-center gap-2">
                    {coach.openEsc > 0 && (
                      <Badge className="bg-red-100 text-red-700 gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {coach.openEsc}
                      </Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold">{coach.teacherCount}</p>
                    <p className="text-xs text-muted-foreground">Teachers</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-700">{coach.completed}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${coach.noShows > 0 ? 'text-red-700' : 'text-muted-foreground'}`}>
                      {coach.noShows}
                    </p>
                    <p className="text-xs text-muted-foreground">No-shows</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
