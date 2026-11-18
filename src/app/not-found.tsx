import SiteLayout from './(site)/layout';
import SiteNotFound from './(site)/not-found';

/** Unknown URLs get the normal site header and footer. */
export default function NotFound() {
  return (
    <SiteLayout>
      <main className="page-enter">
        <SiteNotFound />
      </main>
    </SiteLayout>
  );
}
