import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RYGBadge } from '@/components/shared/RYGBadge'
import { formatDate, formatDateTime } from '@/lib/utils'
import { ArrowLeft, Phone, School, MapPin, User } from 'lucide-react'
import type { RYGStatus } from '@/lib/supabase/types'

export default async function TeacherProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') redirect('/login')

  const { data: teacher, error } = await supabase
    .from('teachers')
    .select(`
      *,
      assignments(coach_id, is_active)
    `)
    .eq('id', id)
    .single()

  if (error || !teacher) notFound()

  // Get latest RYG status and history
  const { data: rygHistory } = await supabase
    .from('teacher_ryg')
    .select('id, status, set_at, prior_status, set_by, dimensions_json')
    .eq('teacher_id', id)
    .order('set_at', { ascending: false })
    .limit(10)

  const currentRYG = rygHistory?.[0] ?? null

  // Get interaction history (last 10 sessions)
  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      id, scheduled_at, status, focus_tag, session_type, duration_mins,
      notes:session_notes(what_discussed, what_decided),
      action_steps(id, description, due_date, status)
    `)
    .eq('teacher_id', id)
    .order('scheduled_at', { ascending: false })
    .limit(10)

  // Get open action steps
  const openSteps = sessions?.flatMap((s: any) =>
    (s.action_steps ?? []).filter((a: any) => a.status === 'open')
  ) ?? []

  return (
    <div className="space-y-4 max-w-3xl">
      <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
        <Link href="/coach"><ArrowLeft className="h-4 w-4" /> Back</Link>
      </Button>

      {/* Teacher header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold">{teacher.name}</h1>
            {currentRYG && <RYGBadge status={currentRYG.status as RYGStatus} />}
          </div>
          <p className="text-sm text-muted-foreground">{teacher.designation ?? 'Teacher'}</p>
        </div>
      </div>

      {/* Contact & school info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <School className="h-4 w-4 text-muted-foreground" />
              <span>{teacher.school_name}</span>
            </div>
            {teacher.block_tag && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{teacher.block_tag}</span>
              </div>
            )}
            {teacher.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono">{teacher.phone}</span>
              </div>
            )}
            {teacher.udise_code && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-mono text-xs">UDISE: {teacher.udise_code}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {(teacher.hm_name || teacher.hm_phone) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Head Master
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-4 space-y-2">
              {teacher.hm_name && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{teacher.hm_name}</span>
                </div>
              )}
              {teacher.hm_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono">{teacher.hm_phone}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Open action steps */}
      {openSteps.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Open action steps ({openSteps.length})</CardTitle>
          </CardHeader>
          <CardContent className="pb-4 space-y-2">
            {openSteps.map((step: any) => (
              <div key={step.id} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm">{step.description}</p>
                  {step.due_date && (
                    <p className="text-xs text-muted-foreground">Due {formatDate(step.due_date)}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Session history */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Session history</CardTitle>
        </CardHeader>
        <CardContent className="pb-4 space-y-3">
          {(!sessions || sessions.length === 0) ? (
            <p className="text-sm text-muted-foreground">No sessions yet.</p>
          ) : (
            sessions.map((s: any, i: number) => (
              <div key={s.id}>
                {i > 0 && <Separator className="mb-3" />}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatDate(s.scheduled_at)}</span>
                      {s.focus_tag && (
                        <Badge variant="outline" className="text-xs">{s.focus_tag}</Badge>
                      )}
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        s.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                        s.status === 'no_show' ? 'bg-red-100 text-red-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                    {s.notes?.what_discussed && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {s.notes.what_discussed}
                      </p>
                    )}
                  </div>
                  <Button asChild variant="ghost" size="sm" className="shrink-0">
                    <Link href={`/coach/sessions/${s.id}/after`}>View</Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* RYG history */}
      {rygHistory && rygHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">RYG status history</CardTitle>
          </CardHeader>
          <CardContent className="pb-4 space-y-2">
            {rygHistory.map((ryg: any) => (
              <div key={ryg.id} className="flex items-center gap-3 text-sm">
                <RYGBadge status={ryg.status as RYGStatus} />
                <span className="text-muted-foreground">{formatDateTime(ryg.set_at)}</span>
                {ryg.prior_status && (
                  <span className="text-xs text-muted-foreground">
                    from <RYGBadge status={ryg.prior_status as RYGStatus} className="inline-flex" />
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
