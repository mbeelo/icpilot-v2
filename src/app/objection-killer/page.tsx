import { ObjectionKiller } from '@/components/features/objection-killer';
import { AppLayout } from '@/components/layout/app-layout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Objection Killer - AI-Powered Sales Objection Handler | ICP Pilot',
  description: 'Transform sales objections into opportunities with AI-powered rebuttals. Generate effective responses using proven methodologies like Sandler and Challenger Sale.',
  keywords: 'sales objections, objection handling, sales rebuttals, AI sales tools, Sandler selling, Challenger sale, sales training',
  openGraph: {
    title: 'Objection Killer - AI-Powered Sales Objection Handler',
    description: 'Transform sales objections into opportunities with AI-powered rebuttals and proven methodologies.',
  }
};

export default function ObjectionKillerPage() {
  return (
    <AppLayout>
      <div className="p-6">
        <ObjectionKiller />
      </div>
    </AppLayout>
  );
}