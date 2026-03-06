'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn, getInitials } from '@/lib/utils'
import { LogOut, Bell, LayoutGrid } from 'lucide-react'
import type { UserRole } from '@/lib/supabase/types'

interface NavItem {
  label: string
  href: string
  exact?: boolean
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  coach: [
    { label: 'Home', href: '/coach', exact: true },
    { label: 'Teachers', href: '/coach/teachers' },
  ],
  cm: [
    { label: 'Home', href: '/cm', exact: true },
    { label: 'Coaches', href: '/cm/coaches' },
    { label: 'Snapshot', href: '/cm/snapshot' },
  ],
  admin: [
    { label: 'Home', href: '/admin', exact: true },
    { label: 'Org', href: '/admin/org' },
    { label: 'Users', href: '/admin/users' },
    { label: 'Rosters', href: '/admin/rosters' },
    { label: 'Assignments', href: '/admin/assignments' },
    { label: 'Standards', href: '/admin/standards' },
  ],
  observer: [
    { label: 'Snapshot', href: '/observer', exact: true },
  ],
}

const ROLE_LABEL: Record<UserRole, string> = {
  coach: 'Coach',
  cm: 'Cluster Manager',
  admin: 'Administrator',
  observer: 'Observer',
}

const ROLE_COLOR: Record<UserRole, string> = {
  coach: 'bg-blue-500',
  cm: 'bg-emerald-500',
  admin: 'bg-violet-500',
  observer: 'bg-amber-500',
}

interface TopNavProps {
  role: UserRole
  userName: string
  escalationCount?: number
}

export function TopNav({ role, userName, escalationCount = 0 }: TopNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const navItems = NAV_ITEMS[role] ?? []

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <header className="sticky top-0 z-40 w-full" style={{ background: 'hsl(222 47% 11%)' }}>
      <div className="flex h-14 items-center px-4 gap-3">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className={cn(
            'w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-xs shrink-0',
            ROLE_COLOR[role]
          )}>
            D
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="font-semibold text-sm text-white">DTSP</span>
            <span className="text-[10px] mt-0.5" style={{ color: 'hsl(218 20% 55%)' }}>Coach Platform</span>
          </div>
        </Link>

        {/* Divider */}
        <div className="w-px h-5 shrink-0" style={{ background: 'hsl(222 30% 22%)' }} />

        {/* Nav */}
        <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                isActive(item)
                  ? 'text-white bg-white/10'
                  : 'hover:text-white hover:bg-white/5'
              )}
              style={isActive(item) ? {} : { color: 'hsl(218 20% 60%)' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1.5 shrink-0">

          {/* Escalation bell — CM only */}
          {role === 'cm' && escalationCount > 0 && (
            <Link
              href="/cm/coaches"
              className="relative p-2 rounded-md transition-colors hover:bg-white/10"
              style={{ color: 'hsl(218 20% 60%)' }}
              title={`${escalationCount} open escalations`}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold leading-none">
                {escalationCount > 9 ? '9+' : escalationCount}
              </span>
            </Link>
          )}

          {/* User */}
          <div className="flex items-center gap-2 pl-1">
            <Avatar className="h-7 w-7 ring-1 ring-white/20">
              <AvatarFallback className={cn('text-[11px] font-semibold text-white', ROLE_COLOR[role])}>
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-xs font-medium text-white">{userName}</span>
              <span className="text-[10px] mt-0.5" style={{ color: 'hsl(218 20% 55%)' }}>
                {ROLE_LABEL[role]}
              </span>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="ml-1 p-2 rounded-md transition-colors hover:bg-white/10"
            style={{ color: 'hsl(218 20% 55%)' }}
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
