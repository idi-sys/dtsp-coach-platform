import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// One-time setup: creates the demo user via Admin API (handles all auth fields correctly)
// Visit GET /api/auth/setup once, then delete this file
export async function GET() {
  const admin = createAdminClient()

  // Delete existing broken user if any
  const { data: { users } } = await admin.auth.admin.listUsers()
  const existing = users.find(u => u.email === 'idi@centralsquarefoundation.org')
  if (existing) {
    await admin.auth.admin.deleteUser(existing.id)
    await admin.from('profiles').delete().eq('id', existing.id)
  }

  // Create user via Admin API — sets all required auth fields correctly
  const { data, error } = await admin.auth.admin.createUser({
    email: 'idi@centralsquarefoundation.org',
    password: 'password',
    email_confirm: true,
  })

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? 'Failed to create user' }, { status: 500 })
  }

  // Insert profile
  const { error: profileError } = await admin.from('profiles').insert({
    id: data.user.id,
    role: 'admin',
    name: 'IDI-DTSP',
  })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: 'User created. You can now log in at /login' })
}
