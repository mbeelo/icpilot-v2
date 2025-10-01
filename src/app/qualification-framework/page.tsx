import { QualificationFramework } from '@/components/features/qualification-framework';
import { AppLayout } from '@/components/layout/app-layout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Qualification Framework - AI Sales Discovery Questions | ICP Pilot',
  description: 'Build powerful qualification frameworks with AI-generated discovery questions. Use proven methodologies like BANT, SPIN, and MEDDIC to qualify prospects effectively.',
  keywords: 'sales qualification, discovery questions, BANT, SPIN selling, MEDDIC, sales methodology, prospect qualification',
  openGraph: {
    title: 'Qualification Framework - AI Sales Discovery Questions',
    description: 'Build powerful qualification frameworks to identify and qualify your best prospects with proven methodologies.',
  }
};

export default function QualificationFrameworkPage() {
  return (
    <AppLayout>
      <div className="p-6">
        <QualificationFramework />
      </div>
    </AppLayout>
  );
}