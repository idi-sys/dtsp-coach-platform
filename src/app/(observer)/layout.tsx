import { WorkspaceShell } from '@/components/shell/WorkspaceShell'

export const dynamic = 'force-dynamic'

export default function ObserverLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell role="observer">{children}</WorkspaceShell>
}
