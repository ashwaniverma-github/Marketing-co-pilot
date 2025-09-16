import DashboardClient from './dashboard-client';
import { DashboardLayout } from '@/components/dashboard-layout';
import { ensureActiveSubscription } from '@/lib/subscription';
import { redirect } from 'next/navigation';


export default async function DashboardPage() {
  const res = await ensureActiveSubscription();

  if (!res.ok) {
    // Not logged in -> send to sign-in with callback
    if (res.reason === "not_authenticated") {
      const callback = encodeURIComponent("/dashboard");
      return redirect(`/login?callbackUrl=${callback}`);
    }

    // No active subscription -> send to pricing/subscribe page
    if (res.reason === "no_active_subscription" || res.reason === "no_user_record") {
      return redirect("/pricing");
    }

  
    return redirect("/pricing");
  }
  return (
    <DashboardLayout>
      <DashboardClient />
    </DashboardLayout>
  );
}