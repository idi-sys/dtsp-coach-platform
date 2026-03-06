import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Thenable query chain for demo mode — never touches Supabase
function makeChain(): any {
  const chain: any = {
    select: () => chain,
    eq: () => chain,
    neq: () => chain,
    in: () => chain,
    gte: () => chain,
    lte: () => chain,
    gt: () => chain,
    lt: () => chain,
    order: () => chain,
    limit: () => chain,
    range: () => chain,
    filter: () => chain,
    match: () => chain,
    not: () => chain,
    or: () => chain,
    upsert: () => chain,
    insert: () => chain,
    update: () => chain,
    delete: () => chain,
    single: () => Promise.resolve({ data: null, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: any, reject?: any) =>
      Promise.resolve({ data: null, error: null }).then(resolve, reject),
  }
  return chain
}

function createDemoClient() {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
    from: (_table: string) => makeChain(),
  }
}

export async function createClient() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return createDemoClient() as any
  }

  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookie mutation ignored
          }
        },
      },
    }
  )
}
