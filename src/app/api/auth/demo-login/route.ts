import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, redirectTo } = await request.json()

  const supabase = createAdminClient()

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
    },
  })

  if (error || !data?.properties?.action_link) {
    return NextResponse.json(
      { error: error?.message ?? 'Failed to generate demo link' },
      { status: 500 }
    )
  }

  return NextResponse.json({ url: data.properties.action_link })
}
