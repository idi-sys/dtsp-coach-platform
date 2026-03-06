import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, GraduationCap, Settings, Upload, UserCog, AlertCircle } from 'lucide-react'
import { DEMO_ADMIN_COUNTS } from '@/lib/demo-data'

export default async function AdminHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') redirect('/login')

  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && !user) {
    const quickLinks = [
      { href: '/admin/org', icon: Settings, label: 'Org Setup', description: 'Configure hierarchy, add cohorts' },
      { href: '/admin/users', icon: UserCog, label: 'User Management', description: 'Create coach and CM accounts' },
      { href: '/admin/rosters', icon: Upload, label: 'Roster Import', description: 'Upload teacher CSV' },
      { href: '/admin/assignments', icon: Users, label: 'Assignments', description: 'Assign teachers to coaches' },
      { href: '/admin/standards', icon: GraduationCap, label: 'Standards & Templates', description: 'Configure rubrics, focus categories' },
    ]

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">DTSP Coach Platform configuration</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Coaches', value: DEMO_ADMIN_COUNTS.coaches },
            { label: 'Active Teachers', value: DEMO_ADMIN_COUNTS.teachers },
            { label: 'Org Units', value: DEMO_ADMIN_COUNTS.orgUnits },
            { label: 'Rubrics', value: DEMO_ADMIN_COUNTS.rubrics },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="hover:bg-muted/40 transition-colors cursor-pointer">
                <CardContent className="pt-4 pb-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                    <link.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{link.label}</p>
                    <p className="text-xs text-muted-foreground">{link.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  const [coachCount, teacherCount, orgCount, standardsExist] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'coach'),
    supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('org_units').select('*', { count: 'exact', head: true }),
    supabase.from('session_templates').select('id', { count: 'exact', head: true }),
  ])

  const warnings: string[] = []
  if ((orgCount.count ?? 0) === 0) warnings.push('No org hierarchy configured — go to Org Setup')
  if ((coachCount.count ?? 0) === 0) warnings.push('No coach accounts created — go to User Management')
  if ((teacherCount.count ?? 0) === 0) warnings.push('No teachers imported — go to Roster Import')
  if ((standardsExist.count ?? 0) === 0) warnings.push('No rubrics configured — go to Standards & Templates')

  const quickLinks = [
    { href: '/admin/org', icon: Settings, label: 'Org Setup', description: 'Configure hierarchy, add cohorts' },
    { href: '/admin/users', icon: UserCog, label: 'User Management', description: 'Create coach and CM accounts' },
    { href: '/admin/rosters', icon: Upload, label: 'Roster Import', description: 'Upload teacher CSV' },
    { href: '/admin/assignments', icon: Users, label: 'Assignments', description: 'Assign teachers to coaches' },
    { href: '/admin/standards', icon: GraduationCap, label: 'Standards & Templates', description: 'Configure rubrics, focus categories' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">DTSP Coach Platform configuration</p>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-4 w-4" />
              Setup incomplete ({warnings.length} item{warnings.length !== 1 ? 's' : ''})
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <ul className="space-y-1">
              {warnings.map((w) => (
                <li key={w} className="text-sm text-amber-700">• {w}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Coaches', value: coachCount.count ?? 0 },
          { label: 'Active Teachers', value: teacherCount.count ?? 0 },
          { label: 'Org Units', value: orgCount.count ?? 0 },
          { label: 'Rubrics', value: standardsExist.count ?? 0 },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:bg-muted/40 transition-colors cursor-pointer">
              <CardContent className="pt-4 pb-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                  <link.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{link.label}</p>
                  <p className="text-xs text-muted-foreground">{link.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
