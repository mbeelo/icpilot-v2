import { ICPBuilder } from '@/components/features/icp-builder';
import { AppLayout } from '@/components/layout/app-layout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ICP Builder - Create Ideal Customer Profiles | ICP Pilot',
  description: 'Build comprehensive ideal customer profiles (ICPs) with AI assistance. Define target markets, pain points, and buyer personas to focus your sales efforts.',
  keywords: 'ideal customer profile, ICP, target market, buyer persona, sales strategy, market segmentation, customer profiling',
  openGraph: {
    title: 'ICP Builder - Create Ideal Customer Profiles',
    description: 'Build comprehensive ideal customer profiles to focus your sales efforts on the right prospects.',
  }
};

export default function ICPBuilderPage() {
  return (
    <AppLayout>
      <div className="p-6">
        <ICPBuilder />
      </div>
    </AppLayout>
  );
}