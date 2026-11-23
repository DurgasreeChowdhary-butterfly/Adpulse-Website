import { getLayoutContent } from '@/services/content';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuditModal } from '@/components/layout/AuditModal';
import { MotionProvider } from '@/components/layout/MotionProvider';

/**
 * Public pages are rebuilt at most every 60 seconds, so admin edits appear on every server process
 * even when the on-demand revalidatePath() in services/content/admin.ts only reaches one of them.
 */
export const revalidate = 60;

/** Shared shell for every public page: header, footer, audit form and motion. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { settings, navigation, services } = await getLayoutContent();
  const navServices = services.map(({ slug, title, summary, icon }) => ({ slug, title, summary, icon }));
  return (
    <>
      <Header nav={navigation.header} services={navServices} />
      {children}
      <Footer footer={navigation.footer} settings={settings} services={services} />
      <AuditModal copy={settings.audit} serviceOptions={services.map((s) => s.title)} privacy={settings.privacy} />
      <MotionProvider />
    </>
  );
}
