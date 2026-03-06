import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { AfterCallScreen } from './AfterCallScreen'

export default async function AfterCallPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') redirect('/login')

  const { data: session, error } = await supabase
    .from('sessions')
    .select(`
      *,
      teacher:teachers(id, name, phone, school_name, block_tag),
      notes:session_notes(*),
      action_steps(*)
    `)
    .eq('id', id)
    .single()

  if (error || !session) notFound()

  // Get focus categories
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

  return (
    <AfterCallScreen
      session={session}
      focusCategories={focusCategories}
      coachId={user.id}
    />
  )
}
