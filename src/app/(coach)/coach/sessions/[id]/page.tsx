import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { CallWorkspace } from './CallWorkspace'

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') redirect('/login')

  // Fetch session with teacher and notes
  const { data: session, error } = await supabase
    .from('sessions')
    .select(`
      *,
      teacher:teachers(
        id, name, phone, school_name, block_tag, designation, hm_name, hm_phone
      ),
      notes:session_notes(*),
      action_steps(*),
      reschedules(*)
    `)
    .eq('id', id)
    .single()

  if (error || !session) notFound()

  // Get focus categories from program standards
  const { data: profile } = await supabase
    .from('profiles')
    .select('cohort_id')
    .eq('id', user.id)
    .single()

  let focusCategories = ['Literacy', 'Numeracy', 'Relationship', 'Off-script']
  if (profile?.cohort_id) {
    const { data: template } = await supabase
      .from('session_templates')
      .select('focus_categories')
      .eq('cohort_id', profile.cohort_id)
      .single()
    if (template?.focus_categories) focusCategories = template.focus_categories
  }

  // Get last session notes for pre-session brief
  const { data: lastSession } = await supabase
    .from('sessions')
    .select(`
      scheduled_at, focus_tag,
      notes:session_notes(what_discussed, what_decided),
      action_steps(description, due_date, status)
    `)
    .eq('teacher_id', session.teacher_id)
    .eq('status', 'completed')
    .neq('id', id)
    .order('scheduled_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Get teacher's latest RYG
  const { data: rygData } = await supabase
    .from('teacher_ryg')
    .select('status, set_at, prior_status')
    .eq('teacher_id', session.teacher_id)
    .order('set_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <CallWorkspace
      session={session}
      lastSession={lastSession}
      currentRYG={rygData?.status ?? null}
      focusCategories={focusCategories}
    />
  )
}
