import { ICPBuilder } from '@/components/features/icp-builder';
import { AppLayout } from '@/components/layout/app-layout';

export default function ICPBuilderPage() {
  return (
    <AppLayout>
      <div className="p-6">
        <ICPBuilder />
      </div>
    </AppLayout>
  );
}