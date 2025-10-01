import { ICPManagement } from '@/components/features/icp-management';
import { AppLayout } from '@/components/layout/app-layout';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function ICPManagementPage() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <ICPManagement />
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
}