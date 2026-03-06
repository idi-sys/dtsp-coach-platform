'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, ChevronDown, ChevronRight, CheckCircle2, XCircle, Video } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface VBAChecklistItem {
  id: string
  label: string
  order: number
}

interface StudentResult {
  id: string
  vba_session_id: string
  student_number: number
  student_name: string
  literacy_results: Record<string, 'pass' | 'fail' | null>
  numeracy_results: Record<string, 'pass' | 'fail' | null>
}

interface VBAWorkspaceProps {
  vbaSession: {
    id: string
    teacher_id: string
    teacher: { id: string; name: string; school_name: string; phone: string | null }
    scheduled_at: string
    status: string
    meet_link?: string | null
  }
  studentResults: StudentResult[]
  vbaChecklist: VBAChecklistItem[]
}

// VBA items — literacy and numeracy assessment items
const LITERACY_ITEMS = [
  { id: 'letter_recognition', label: 'Letter recognition' },
  { id: 'word_reading', label: 'Word reading' },
  { id: 'sentence_reading', label: 'Sentence reading' },
  { id: 'paragraph_reading', label: 'Paragraph reading' },
]

const NUMERACY_ITEMS = [
  { id: 'number_recognition', label: 'Number recognition (1-99)' },
  { id: 'addition', label: 'Addition (1-digit)' },
  { id: 'subtraction', label: 'Subtraction (1-digit)' },
  { id: 'word_problem', label: 'Word problem' },
]

// Default student count — up to 26
const DEFAULT_STUDENT_COUNT = 10

export function VBAWorkspace({ vbaSession, studentResults, vbaChecklist }: VBAWorkspaceProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [expandedStudent, setExpandedStudent] = useState<number | null>(1) // Auto-expand first student
  const [results, setResults] = useState<Record<number, StudentResult>>(
    Object.fromEntries(studentResults.map((s) => [s.student_number, s]))
  )
  const [studentCount] = useState(DEFAULT_STUDENT_COUNT)
  const [saving, setSaving] = useState(false)
  const [closingSession, setClosingSession] = useState(false)

  // Auto-save when a result changes — idempotent PATCH
  const saveResult = useCallback(async (studentNumber: number, field: 'literacy_results' | 'numeracy_results', itemId: string, value: 'pass' | 'fail' | null) => {
    const current = results[studentNumber] ?? {
      vba_session_id: vbaSession.id,
      student_number: studentNumber,
      student_name: `Student ${studentNumber}`,
      literacy_results: {},
      numeracy_results: {},
    }

    const updated = {
      ...current,
      [field]: { ...current[field], [itemId]: value },
    }

    // Optimistic update
    setResults((prev) => ({ ...prev, [studentNumber]: updated as StudentResult }))

    try {
      await fetch(`/api/vba/sessions/${vbaSession.id}/student/${studentNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_number: studentNumber,
          student_name: `Student ${studentNumber}`,
          [field]: updated[field],
        }),
      })
    } catch {
      // Silent fail — data is preserved in state, coach can retry
    }
  }, [results, vbaSession.id])

  function toggleStudent(num: number) {
    setExpandedStudent(expandedStudent === num ? null : num)
  }

  function getPassCount(studentNumber: number) {
    const r = results[studentNumber]
    if (!r) return { lit: 0, num: 0 }
    const lit = Object.values(r.literacy_results ?? {}).filter((v) => v === 'pass').length
    const num = Object.values(r.numeracy_results ?? {}).filter((v) => v === 'pass').length
    return { lit, num }
  }

  async function closeSession() {
    setClosingSession(true)
    try {
      await fetch(`/api/vba/sessions/${vbaSession.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist_items_done: [] }),
      })
      router.push(`/coach/vba/${vbaSession.id}/after`)
    } catch {
      toast({ title: 'Close failed', variant: 'destructive' })
      setClosingSession(false)
    }
  }

  const completedStudents = Object.values(results).length

  return (
    <div className="space-y-4 max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
        <Link href="/coach"><ArrowLeft className="h-4 w-4" /> Back</Link>
      </Button>

      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold">VBA — {vbaSession.teacher.name}</h1>
          <Badge className="bg-blue-50 text-blue-700 border-blue-200">Video-Based Assessment</Badge>
          {vbaSession.meet_link && (
            <Button
              size="sm"
              className="gap-2 bg-green-600 hover:bg-green-700 text-white ml-auto"
              onClick={() => window.open(vbaSession.meet_link!, 'dtsp-vba', 'width=1200,height=800')}
            >
              <Video className="h-4 w-4" /> Join Meet
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {vbaSession.teacher.school_name} · {formatDateTime(vbaSession.scheduled_at)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Coach shows items to student via Meet · Teacher holds phone · {completedStudents}/{studentCount} students assessed
        </p>
      </div>

      {/* Student roster */}
      <div className="space-y-1">
        {Array.from({ length: studentCount }, (_, i) => i + 1).map((num) => {
          const isExpanded = expandedStudent === num
          const r = results[num]
          const { lit, num: numPass } = getPassCount(num)
          const hasData = !!r

          return (
            <Card key={num} className={hasData ? 'border-green-200' : ''}>
              {/* Collapsed row — single tap to expand */}
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                onClick={() => toggleStudent(num)}
              >
                <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0">
                  {num}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">Student {num}</span>
                  {hasData && (
                    <span className="text-xs text-muted-foreground ml-2">
                      L: {lit}/{LITERACY_ITEMS.length} · N: {numPass}/{NUMERACY_ITEMS.length}
                    </span>
                  )}
                </div>
                {hasData && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
                {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
              </button>

              {/* Expanded — pass/fail capture */}
              {isExpanded && (
                <CardContent className="pt-0 pb-4 border-t">
                  <div className="space-y-4 mt-3">
                    {/* Literacy */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Literacy</p>
                      <div className="space-y-2">
                        {LITERACY_ITEMS.map((item) => {
                          const val = r?.literacy_results?.[item.id] ?? null
                          return (
                            <div key={item.id} className="flex items-center justify-between gap-2">
                              <span className="text-sm">{item.label}</span>
                              <div className="flex gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => saveResult(num, 'literacy_results', item.id, val === 'pass' ? null : 'pass')}
                                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                    val === 'pass'
                                      ? 'bg-green-600 text-white border-green-600'
                                      : 'bg-background border-green-300 text-green-700 hover:bg-green-50'
                                  }`}
                                >
                                  <CheckCircle2 className="h-3 w-3" /> Pass
                                </button>
                                <button
                                  type="button"
                                  onClick={() => saveResult(num, 'literacy_results', item.id, val === 'fail' ? null : 'fail')}
                                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                    val === 'fail'
                                      ? 'bg-red-600 text-white border-red-600'
                                      : 'bg-background border-red-300 text-red-700 hover:bg-red-50'
                                  }`}
                                >
                                  <XCircle className="h-3 w-3" /> Fail
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Numeracy */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Numeracy</p>
                      <div className="space-y-2">
                        {NUMERACY_ITEMS.map((item) => {
                          const val = r?.numeracy_results?.[item.id] ?? null
                          return (
                            <div key={item.id} className="flex items-center justify-between gap-2">
                              <span className="text-sm">{item.label}</span>
                              <div className="flex gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => saveResult(num, 'numeracy_results', item.id, val === 'pass' ? null : 'pass')}
                                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                    val === 'pass' ? 'bg-green-600 text-white border-green-600' : 'bg-background border-green-300 text-green-700 hover:bg-green-50'
                                  }`}
                                >
                                  <CheckCircle2 className="h-3 w-3" /> Pass
                                </button>
                                <button
                                  type="button"
                                  onClick={() => saveResult(num, 'numeracy_results', item.id, val === 'fail' ? null : 'fail')}
                                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                    val === 'fail' ? 'bg-red-600 text-white border-red-600' : 'bg-background border-red-300 text-red-700 hover:bg-red-50'
                                  }`}
                                >
                                  <XCircle className="h-3 w-3" /> Fail
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Auto-advance to next student */}
                    {num < studentCount && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedStudent(num + 1)}
                        className="w-full"
                      >
                        Next: Student {num + 1} →
                      </Button>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Close VBA */}
      <div className="sticky bottom-4 pt-4">
        <Button
          onClick={closeSession}
          disabled={closingSession}
          size="lg"
          className="w-full gap-2"
        >
          <CheckCircle2 className="h-5 w-5" />
          {closingSession ? 'Closing…' : 'Complete VBA & write summary'}
        </Button>
      </div>
    </div>
  )
}
