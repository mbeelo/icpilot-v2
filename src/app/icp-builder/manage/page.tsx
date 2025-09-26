import { ICPManagement } from '@/components/features/icp-management';
import { AppLayout } from '@/components/layout/app-layout';

export default function ICPManagementPage() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <ICPManagement />
      </div>
    </AppLayout>
  );
}