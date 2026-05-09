import { redirect } from 'next/navigation';

/**
 * /admin — redirect straight to /admin/dashboard
 */
export default function AdminRedirect() {
  redirect('/admin/dashboard');
}
