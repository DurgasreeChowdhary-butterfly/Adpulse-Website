import Link from 'next/link';
import type { Navigation, Service, SiteSettings } from '@/types/content';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { withYear } from '@/utils/format';
import { NewsletterForm } from './NewsletterForm';

interface Props {
  footer: Navigation['footer'];
  settings: SiteSettings;
  services: Pick<Service, 'slug' | 'title'>[];
}

export function Footer({ footer, settings, services }: Props) {
  return (
    <footer>
      <div className="wrap">
        <div className="f-grid">
          <div>
            <Logo label={settings.shortName} />
            <p className="about-f">{footer.about}</p>
            <div className="socials">
              {settings.socials.map((s) => (
                <a key={s.label} href={s.url} aria-label={s.label} target="_blank" rel="noopener noreferrer">
                  <Icon name={s.icon} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4>{footer.servicesTitle}</h4>
            <ul>
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`}>{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>{footer.companyTitle}</h4>
            <ul>
              {footer.companyLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>{footer.contactTitle}</h4>
            <div className="ct">
              <div>
                <Icon name="c-pin" />
                <span>{settings.contact.address}</span>
              </div>
              {settings.contact.phones
                .filter((p) => p.number.trim())
                .map((p) => (
                  <div key={p.number}>
                    <Icon name="c-phone" />
                    <span>
                      <a href={`tel:${p.number.replace(/[^\d+]/g, '')}`}>{p.number}</a>
                      {p.label && ` · ${p.label}`}
                    </span>
                  </div>
                ))}
              <div>
                <Icon name="c-mail" />
                <span>{settings.contact.email}</span>
              </div>
              {settings.contact.otherEmails
                .filter((e) => e.address.trim())
                .map((e) => (
                  <div key={e.address}>
                    <Icon name="c-mail" />
                    <span>
                      {e.address}
                      {e.label && ` · ${e.label}`}
                    </span>
                  </div>
                ))}
              <div>
                <Icon name="c-web" />
                <span>{settings.contact.website}</span>
              </div>
            </div>
            <NewsletterForm label={settings.newsletter.label} placeholder={settings.newsletter.placeholder} successText={settings.newsletter.successText} privacy={settings.privacy} />
          </div>
        </div>
        <div className="f-bot">
          <span>{withYear(footer.copyright)}</span>
          <span>{settings.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
