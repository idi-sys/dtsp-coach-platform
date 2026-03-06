import { WorkspaceShell } from '@/components/shell/WorkspaceShell'

export const dynamic = 'force-dynamic'

export default function CMLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell role="cm">{children}</WorkspaceShell>
}
