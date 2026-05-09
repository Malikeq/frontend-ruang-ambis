'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';

/**
 * Layout for all /admin/* routes.
 * Consistent with the (dashboard) pattern — AdminLayout provides the sidebar,
 * navigation, and admin chrome. Auth is enforced by middleware.ts.
 */
export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
