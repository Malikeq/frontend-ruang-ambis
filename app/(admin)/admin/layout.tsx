// Auth is enforced by middleware.ts — no server check needed here.
// AdminLayout is provided by app/(admin)/layout.tsx (the group layout).
export default function AdminInnerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
