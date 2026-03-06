import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CoachHome } from './CoachHome'
import { format } from 'date-fns'
import { DEMO_COACH_SESSIONS, DEMO_DUE_ACTIONS } from '@/lib/demo-data'

export default async function CoachPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') redirect('/login')

  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && !user) {
    return <CoachHome todaySessions={DEMO_COACH_SESSIONS as any} dueActions={DEMO_DUE_ACTIONS} />
  }

  const today = format(new Date(), 'yyyy-MM-dd')

  // Fetch today's sessions
  const { data: todaySessions } = await supabase
    .from('sessions')
    .select(`
      *,
      teacher:teachers(id, name, school_name, block_tag, phone),
      ryg:teacher_ryg(status, set_at)
    `)
    .gte('scheduled_at', `${today}T00:00:00`)
    .lte('scheduled_at', `${today}T23:59:59`)
    .not('status', 'in', '("cancelled")')
    .order('scheduled_at', { ascending: true })

  // Fetch incomplete sessions (past sessions without notes)
  const { data: incompleteRaw } = await supabase
    .from('sessions')
    .select(`
      id, scheduled_at, teacher:teachers(name),
      notes:session_notes(id, what_discussed)
    `)
    .eq('status', 'completed')
    .lt('scheduled_at', `${today}T00:00:00`)
    .is('summary_sent_at', null)
    .order('scheduled_at', { ascending: false })
    .limit(10)

  const dueActions = (incompleteRaw ?? [])
    .filter((s: any) => !s.notes?.what_discussed)
    .map((s: any) => ({
      sessionId: s.id,
      teacherName: s.teacher?.name ?? 'Unknown',
      type: 'incomplete_notes' as const,
      label: 'Notes not completed',
    }))

  // Process sessions: get latest RYG for each teacher
  const sessions = (todaySessions ?? []).map((s: any) => ({
    ...s,
    teacher: {
      ...s.teacher,
      ryg: s.ryg?.length > 0
        ? s.ryg.sort((a: any, b: any) => new Date(b.set_at).getTime() - new Date(a.set_at).getTime())[0]
        : null,
    },
  }))

  return <CoachHome todaySessions={sessions} dueActions={dueActions} />
}
