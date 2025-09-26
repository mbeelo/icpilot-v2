import { ObjectionKiller } from '@/components/features/objection-killer';
import { AppLayout } from '@/components/layout/app-layout';

export default function ObjectionKillerPage() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Objection Killer</h1>
          <p className="text-gray-600">Generate bulletproof rebuttals for any sales objection</p>
        </div>
        <ObjectionKiller />
      </div>
    </AppLayout>
  );
}