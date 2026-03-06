import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Observer sees same snapshot as CM — redirect to a shared snapshot view
export default async function ObserverPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') redirect('/login')

  // For alpha, observer sees the same leadership snapshot view as CM
  // In a future build, scope this to org_units the observer is assigned to
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">State Observer View</h1>
        <p className="text-sm text-muted-foreground">Read-only program snapshot</p>
      </div>
      <p className="text-sm text-muted-foreground">
        Observer dashboard is scoped to your assigned org unit. Contact your program admin to configure access.
      </p>
    </div>
  )
}
