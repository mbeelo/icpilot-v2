import { OutputLibrary } from '@/components/features/output-library';
import { AppLayout } from '@/components/layout/app-layout';

export default function LibraryPage() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <OutputLibrary />
      </div>
    </AppLayout>
  );
}