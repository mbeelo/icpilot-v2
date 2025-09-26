import { MessageGenerator } from '@/components/features/message-generator';
import { AppLayout } from '@/components/layout/app-layout';

export default function MessageGeneratorPage() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Message Generator</h1>
          <p className="text-gray-600">Create personalized outreach that gets responses</p>
        </div>
        <MessageGenerator />
      </div>
    </AppLayout>
  );
}