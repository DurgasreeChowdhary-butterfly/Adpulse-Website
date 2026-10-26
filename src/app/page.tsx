import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";

// Temporary setup screen proving the tokens, font and logo work.
// Replaced by the real homepage sections in a later step.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Container className="flex flex-1 flex-col items-center justify-center gap-8 py-section text-center">
        <Logo height={64} priority />
        <h1 className="text-[2rem] leading-[1.1] font-extrabold text-ink md:text-display">
          AdPulse <span className="text-orange-500">–</span> setup complete
        </h1>
        <div className="flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center rounded-pill bg-orange-100 px-4 py-2 text-eyebrow font-semibold text-red-600">
            Design tokens loaded
          </span>
          <span className="rounded-btn bg-brand-gradient px-5 py-3 text-body font-semibold text-on-dark shadow-btn">
            Get Free Growth Audit →
          </span>
        </div>
      </Container>
      <div className="bg-navy-900 py-6">
        <Container className="flex flex-wrap items-center justify-between gap-4">
          <Logo variant="reversed" height={40} />
          <p className="text-body text-on-dark-muted">Plus Jakarta Sans · Next.js · Tailwind</p>
        </Container>
      </div>
    </main>
  );
}
