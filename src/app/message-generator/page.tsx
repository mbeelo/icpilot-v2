import { MessageGenerator } from '@/components/features/message-generator';
import { AppLayout } from '@/components/layout/app-layout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Message Generator - AI-Powered Sales Outreach | ICP Pilot',
  description: 'Generate personalized sales messages and outreach sequences with AI. Create compelling emails, LinkedIn messages, and cold outreach that converts.',
  keywords: 'sales messages, outreach automation, AI email generator, sales prospecting, personalized outreach, cold email',
  openGraph: {
    title: 'Message Generator - AI-Powered Sales Outreach',
    description: 'Generate personalized sales messages and outreach sequences that convert prospects into customers.',
  }
};

export default function MessageGeneratorPage() {
  return (
    <AppLayout>
      <div className="p-6">
        <MessageGenerator />
      </div>
    </AppLayout>
  );
}