import { promises as fs } from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { sectionBySlug } from '@/admin/sections';
import { ContentEditor } from '@/components/admin/ContentEditor';
import { EnquiriesManager } from '@/components/admin/EnquiriesManager';
import { MediaManager } from '@/components/admin/MediaManager';
import { readForAdmin, writesAllowed } from '@/services/content/admin';

/** The editor must always load the latest saved content, never a build-time copy. */
export const dynamic = 'force-dynamic';

/** Icon ids available in /public/icons.svg, offered as suggestions in icon fields. */
async function iconIds(): Promise<string[]> {
  const svg = await fs.readFile(path.join(process.cwd(), 'public', 'icons.svg'), 'utf8').catch(() => '');
  return Array.from(svg.matchAll(/<symbol id="([^"]+)"/g), (m) => m[1]);
}

export default async function AdminSectionPage({ params }: { params: { section: string } }) {
  const section = sectionBySlug(params.section);
  if (!section || !section.slug) notFound();

  if (section.slug === 'media') return <MediaManager writable={writesAllowed()} />;
  if (section.slug === 'enquiries') return <EnquiriesManager />;
  if (!section.collection) notFound();

  const [data, services, icons] = await Promise.all([readForAdmin(section.collection), readForAdmin('services'), iconIds()]);
  return (
    <ContentEditor
      key={section.collection}
      collection={section.collection}
      initial={data}
      title={section.label}
      description={section.description}
      preview={section.preview}
      writable={writesAllowed()}
      refs={{ services: services.items.map((s) => ({ value: s.slug, label: s.title })), icons }}
    />
  );
}
