import { MessageGenerator } from '@/components/features/message-generator';
import { AppLayout } from '@/components/layout/app-layout';

export default function MessageGeneratorPage() {
  return (
    <AppLayout>
      <div className="p-6">
        <MessageGenerator />
      </div>
    </AppLayout>
  );
}