import { QualificationFramework } from '@/components/features/qualification-framework';
import { AppLayout } from '@/components/layout/app-layout';

export default function QualificationFrameworkPage() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Qualification Framework</h1>
          <p className="text-gray-600">Build discovery systems that identify ideal prospects</p>
        </div>
        <QualificationFramework />
      </div>
    </AppLayout>
  );
}