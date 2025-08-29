import DashboardClient from './dashboard-client';
import { DashboardLayout } from '@/components/dashboard-layout';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardClient />
    </DashboardLayout>
  );
}