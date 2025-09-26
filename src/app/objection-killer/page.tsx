import { ObjectionKiller } from '@/components/features/objection-killer';
import { AppLayout } from '@/components/layout/app-layout';

export default function ObjectionKillerPage() {
  return (
    <AppLayout>
      <div className="p-6">
        <ObjectionKiller />
      </div>
    </AppLayout>
  );
}