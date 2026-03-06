'use client'

import { useState } from 'react'
import type { UserRole } from '@/lib/supabase/types'

const ROLES: { role: UserRole; label: string; accent: string }[] = [
  { role: 'coach',    label: 'Coach',    accent: 'bg-blue-500' },
  { role: 'cm',       label: 'CM',       accent: 'bg-emerald-500' },
  { role: 'admin',    label: 'Admin',    accent: 'bg-violet-500' },
  { role: 'observer', label: 'Observer', accent: 'bg-amber-500' },
]

export function DemoBar({ role }: { role: UserRole }) {
  const [switching, setSwitching] = useState<UserRole | null>(null)

  async function switchRole(next: UserRole) {
    if (next === role || switching) return
    setSwitching(next)
    window.location.href = `/${next}`
  }

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-between px-5 py-2.5"
      style={{ background: 'hsl(222 47% 8%)', borderTop: '1px solid hsl(222 30% 18%)' }}
    >
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded"
          style={{ color: 'hsl(38 90% 60%)', background: 'hsl(38 80% 15%)' }}
        >
          Demo
        </span>
        <span className="text-xs" style={{ color: 'hsl(218 20% 45%)' }}>switch role:</span>
      </div>

      <div className="flex items-center gap-1">
        {ROLES.map(({ role: r, label, accent }) => {
          const isActive = r === role
          const isLoading = switching === r
          return (
            <button
              key={r}
              onClick={() => switchRole(r)}
              disabled={switching !== null}
              className={[
                'px-3 py-1 rounded-full text-[11px] font-semibold transition-all',
                isActive
                  ? `${accent} text-white shadow-sm`
                  : 'text-slate-400 hover:text-white hover:bg-white/8',
                switching !== null && !isActive ? 'opacity-40 cursor-not-allowed' : '',
              ].join(' ')}
            >
              {isLoading ? '…' : label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
