import { OutputLibrary } from '@/components/features/output-library';
import { AppLayout } from '@/components/layout/app-layout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Output Library - Saved Sales Content | ICP Pilot',
  description: 'Access your saved sales content library. View, organize, and reuse your AI-generated objection rebuttals, messages, and qualification frameworks.',
  keywords: 'sales content library, saved outputs, sales templates, objection rebuttals, sales messages, qualification frameworks',
  openGraph: {
    title: 'Output Library - Saved Sales Content',
    description: 'Access and organize your AI-generated sales content in one convenient library.',
  }
};

export default function LibraryPage() {
  return (
    <AppLayout>
      <div className="px-6 py-8">
        <OutputLibrary />
      </div>
    </AppLayout>
  );
}