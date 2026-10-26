import { Container } from "@/components/ui/Container";

type PlaceholderPageProps = {
  title: string;
  description?: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <main className="flex flex-1 items-center py-section">
      <Container>
        <h1 className="text-h2 text-ink">{title}</h1>
        <p className="mt-3 text-body text-ink-muted">
          {description ?? "This page is coming soon."}
        </p>
      </Container>
    </main>
  );
}
