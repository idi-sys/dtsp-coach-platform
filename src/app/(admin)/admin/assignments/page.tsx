import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AssignmentsPage } from './AssignmentsPage'

export default async function Assignments() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') redirect('/login')

  const [coaches, teachers] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, name, cohort_id')
      .eq('role', 'coach')
      .order('name'),
    supabase
      .from('teachers')
      .select(`
        id, name, school_name, block_tag, cohort_id,
        assignments(coach_id, is_active)
      `)
      .eq('status', 'active')
      .order('name'),
  ])

  return (
    <AssignmentsPage
      coaches={coaches.data ?? []}
      teachers={teachers.data ?? []}
    />
  )
}
