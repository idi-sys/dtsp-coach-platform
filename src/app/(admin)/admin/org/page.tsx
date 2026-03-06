import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OrgSetup } from './OrgSetup'

export default async function OrgPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') redirect('/login')

  const { data: orgUnits } = await supabase
    .from('org_units')
    .select('id, name, type, parent_id')
    .order('type')
    .order('name')

  return <OrgSetup orgUnits={orgUnits ?? []} />
}
