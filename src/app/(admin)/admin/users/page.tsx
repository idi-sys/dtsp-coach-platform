import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserManagement } from './UserManagement'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') redirect('/login')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, role, phone, cohort_id, created_at')
    .in('role', ['coach', 'cm', 'observer'])
    .order('created_at', { ascending: false })

  const { data: orgUnits } = await supabase
    .from('org_units')
    .select('id, name, type')
    .eq('type', 'cohort')
    .order('name')

  return <UserManagement users={profiles ?? []} cohorts={orgUnits ?? []} />
}
