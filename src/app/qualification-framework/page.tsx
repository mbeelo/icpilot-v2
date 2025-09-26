import { QualificationFramework } from '@/components/features/qualification-framework';
import { AppLayout } from '@/components/layout/app-layout';

export default function QualificationFrameworkPage() {
  return (
    <AppLayout>
      <div className="p-6">
        <QualificationFramework />
      </div>
    </AppLayout>
  );
}