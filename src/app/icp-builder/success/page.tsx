import { ICPSuccess } from '@/components/features/icp-success';
import { AppLayout } from '@/components/layout/app-layout';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function ICPSuccessPage() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <ICPSuccess />
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
}