import Link from 'next/link';
import { ADMIN_SECTIONS } from '@/admin/sections';
import { Icon } from '@/components/ui/Icon';
import { readForAdmin, writesAllowed } from '@/services/content/admin';
import { enquiryStore } from '@/services/enquiries/store';

/** Counts the main list in each collection for the dashboard tiles. */
async function counts() {
  const leads = await Promise.resolve()
    .then(() => enquiryStore().counts())
    .then((c) => `${c.newAudits} new audit request${c.newAudits === 1 ? '' : 's'} · ${c.audits} total · ${c.subscribers} subscriber${c.subscribers === 1 ? '' : 's'}`)
    .catch(() => 'Database not connected');
  const [services, cases, insights, industries, clients, testimonials] = await Promise.all([
    readForAdmin('services'),
    readForAdmin('case-studies'),
    readForAdmin('insights'),
    readForAdmin('industries'),
    readForAdmin('clients'),
    readForAdmin('testimonials'),
  ]);
  return {
    services: `${services.items.length} services`,
    'case-studies': `${cases.items.length} case studies · ${cases.items.filter((c) => c.showOnHome).length} on homepage · ${cases.items.filter((c) => c.isSample).length} samples`,
    insights: `${insights.items.filter((p) => p.status !== 'draft').length} published · ${insights.items.filter((p) => p.status === 'draft').length} drafts · ${insights.items.filter((p) => p.isSample).length} samples`,
    industries: `${industries.items.length} industries`,
    clients: `${clients.items.filter((c) => c.style !== 'placeholder').length} real logos · ${clients.items.filter((c) => c.style === 'placeholder').length} placeholders`,
    enquiries: leads,
    testimonials: testimonials.enabled ? `${testimonials.items.filter((t) => t.visible !== false).length} quotes · section visible` : 'Section hidden on the site',
  } as Record<string, string>;
}

export default async function AdminDashboard() {
  const c = await counts();
  return (
    <>
      <div className="adm-top">
        <div>
          <h1>Dashboard</h1>
          <p>Every piece of website content is managed here. Choose a section to edit it, then save and preview.</p>
        </div>
      </div>
      {!writesAllowed() && <div className="adm-note">Saving is disabled in this environment. See README → Admin panel.</div>}
      <div className="adm-grid">
        {ADMIN_SECTIONS.filter((s) => s.slug).map((s) => (
          <Link key={s.slug} className="adm-tile" href={`/admin/${s.slug}`}>
            <Icon name={s.icon} />
            <b>{s.label}</b>
            <span>{s.description}</span>
            {c[s.slug] && <em>{c[s.slug]}</em>}
          </Link>
        ))}
      </div>
    </>
  );
}
