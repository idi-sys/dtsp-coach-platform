import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { DEMO_VBA_SESSION } from '@/lib/demo-data'

export default async function AfterVBAPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') redirect('/login')

  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && !user) {
    if (id !== 'demo-vba-1') notFound()
    return (
      <div className="space-y-4 max-w-2xl">
        <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
          <Link href="/coach"><ArrowLeft className="h-4 w-4" /> Back to Home</Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">VBA Summary — {DEMO_VBA_SESSION.teacher.name}</h1>
          <p className="text-sm text-muted-foreground">{formatDateTime(DEMO_VBA_SESSION.scheduled_at)}</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[['8', 'Students assessed', ''], ['6', 'Literacy passes', 'text-green-700'], ['5', 'Numeracy passes', 'text-blue-700']].map(([v, l, c]) => (
            <Card key={l}><CardContent className="pt-4 pb-4 text-center">
              <p className={`text-2xl font-bold ${c}`}>{v}</p>
              <p className="text-xs text-muted-foreground">{l}</p>
            </CardContent></Card>
          ))}
        </div>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">WhatsApp summary for teacher</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">Generate a VBA results summary to share with the teacher via WhatsApp.</p>
            <Button asChild variant="outline" size="sm"><Link href="/coach">Return to home</Link></Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { data: vbaSession, error } = await supabase
    .from('vba_sessions')
    .select(`
      *,
      teacher:teachers(id, name, school_name, phone)
    `)
    .eq('id', id)
    .single()

  if (error || !vbaSession) notFound()

  const { data: studentResults } = await supabase
    .from('vba_student_results')
    .select('*')
    .eq('vba_session_id', id)
    .order('student_number')

  const results = studentResults ?? []
  const totalStudents = results.length
  const totalLiteracyPasses = results.reduce((sum, r: any) =>
    sum + Object.values(r.literacy_results ?? {}).filter((v) => v === 'pass').length, 0)
  const totalNumeracyPasses = results.reduce((sum, r: any) =>
    sum + Object.values(r.numeracy_results ?? {}).filter((v) => v === 'pass').length, 0)

  return (
    <div className="space-y-4 max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
        <Link href="/coach"><ArrowLeft className="h-4 w-4" /> Back to Home</Link>
      </Button>

      <div>
        <h1 className="text-xl font-bold">VBA Summary — {vbaSession.teacher.name}</h1>
        <p className="text-sm text-muted-foreground">{formatDateTime(vbaSession.scheduled_at)}</p>
      </div>

      {/* Results summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold">{totalStudents}</p>
            <p className="text-xs text-muted-foreground">Students assessed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-green-700">{totalLiteracyPasses}</p>
            <p className="text-xs text-muted-foreground">Literacy passes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{totalNumeracyPasses}</p>
            <p className="text-xs text-muted-foreground">Numeracy passes</p>
          </CardContent>
        </Card>
      </div>

      {/* WhatsApp summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">WhatsApp summary for teacher</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Generate a VBA results summary to share with the teacher via WhatsApp.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/coach">Return to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
