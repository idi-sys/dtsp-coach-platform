import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { CM1on1Workspace } from './CM1on1Workspace'

export default async function CMCoachPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: coachId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') redirect('/login')

  const { data: coach, error } = await supabase
    .from('profiles')
    .select('id, name, cohort_id')
    .eq('id', coachId)
    .single()

  if (error || !coach) notFound()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [sessions, escalations, teachers, commitments] = await Promise.all([
    supabase
      .from('sessions')
      .select(`
        id, scheduled_at, status, focus_tag, confirmation_status, duration_mins, session_type,
        teacher:teachers(id, name, school_name, block_tag),
        notes:session_notes(what_discussed, what_decided)
      `)
      .eq('coach_id', coachId)
      .gte('scheduled_at', thirtyDaysAgo)
      .order('scheduled_at', { ascending: false }),

    supabase
      .from('escalations')
      .select(`
        *, teacher:teachers(id, name, school_name)
      `)
      .eq('coach_id', coachId)
      .in('status', ['open', 'in_progress'])
      .order('auto_created_at', { ascending: false }),

    supabase
      .from('assignments')
      .select(`
        teacher:teachers(
          id, name, school_name, block_tag,
          ryg:teacher_ryg(status, set_at)
        )
      `)
      .eq('coach_id', coachId)
      .eq('is_active', true),

    supabase
      .from('cm_commitments')
      .select('*')
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // Get rubric dimensions for spot-check
  const { data: profile } = await supabase
    .from('profiles')
    .select('cohort_id')
    .eq('id', user.id)
    .single()

  let rubricDimensions: { id: string; label: string; scale_min: number; scale_max: number }[] = []
  if (profile?.cohort_id) {
    const { data: template } = await supabase
      .from('session_templates')
      .select('rubric_json')
      .eq('cohort_id', profile.cohort_id)
      .maybeSingle()
    if (template?.rubric_json) rubricDimensions = template.rubric_json
  }

  // Process teachers: get latest RYG
  const teacherList = (teachers.data ?? []).map((a: any) => ({
    ...a.teacher,
    ryg: a.teacher.ryg?.sort((x: any, y: any) =>
      new Date(y.set_at).getTime() - new Date(x.set_at).getTime()
    )[0] ?? null,
  }))

  return (
    <div className="space-y-4 max-w-4xl">
      <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
        <Link href="/cm/coaches"><ArrowLeft className="h-4 w-4" /> Back to Coaches</Link>
      </Button>
      <CM1on1Workspace
        coach={coach}
        sessions={sessions.data ?? []}
        escalations={escalations.data ?? []}
        teachers={teacherList}
        recentCommitments={commitments.data ?? []}
        rubricDimensions={rubricDimensions}
        cmId={user.id}
      />
    </div>
  )
}
