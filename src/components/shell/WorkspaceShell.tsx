import { createClient } from '@/lib/supabase/server'
import { TopNav } from './TopNav'
import { DemoBar } from './DemoBar'
import type { UserRole } from '@/lib/supabase/types'

interface WorkspaceShellProps {
  role: UserRole
  children: React.ReactNode
}

export async function WorkspaceShell({ role, children }: WorkspaceShellProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userName = 'User'
  let escalationCount = 0

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()

    if (profile) userName = profile.name

    // CM: fetch open escalation count
    if (role === 'cm') {
      const { count } = await supabase
        .from('escalations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open')

      escalationCount = count ?? 0
    }
  }

  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  if (isDemo && !user) {
    userName = 'IDI-DTSP'
    if (role === 'cm') escalationCount = 2
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role={role} userName={userName} escalationCount={escalationCount} />
      <main className={`flex-1 container mx-auto px-4 py-6 max-w-7xl ${isDemo ? 'pb-14' : ''}`}>
        {children}
      </main>
      {isDemo && <DemoBar role={role} />}
    </div>
  )
}
