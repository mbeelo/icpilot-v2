import { ICPBuilder } from '@/components/features/icp-builder';
import { AppLayout } from '@/components/layout/app-layout';

export default function ICPBuilderPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ICP Builder</h1>
          <p className="text-gray-600">Create and manage your Ideal Customer Profiles</p>
        </div>
        <ICPBuilder />
      </div>
    </AppLayout>
  );
}