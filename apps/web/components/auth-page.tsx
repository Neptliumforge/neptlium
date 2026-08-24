import Link from 'next/link';
import { Brand } from '@/components/brand';
import { SITE } from '@/lib/content/site';

export function AuthPage({
  eyebrow,
  title,
  intro,
  action,
  links = [],
}: {
  eyebrow: string;
  title: string;
  intro: string;
  action: string;
  links?: readonly [string, string][];
}) {
  const isReturnState = action === 'Return to Neptlium';
  const safeLinks = links.filter(([, href]) => !href.startsWith('/auth/'));

  return (
    <main className="min-h-[70vh] bg-surface-subtle px-6 py-16 md:py-24">
      <div className="mx-auto max-w-md border border-line bg-background p-7 md:p-10">
        <Brand />
        <p className="eyebrow mt-12">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">{title}</h1>
        <p className="mt-4 leading-relaxed text-muted">{intro}</p>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Authenticated application access is certified separately from this public website.
        </p>
        <div className="mt-8 grid gap-3">
          <Link
            className="button w-full justify-center"
            href={isReturnState ? '/' : SITE.publicAccessUrl}
          >
            {isReturnState ? action : SITE.publicAccessLabel}
          </Link>
        </div>
        {safeLinks.length > 0 && (
          <nav
            className="mt-7 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted"
            aria-label="Public website links"
          >
            {safeLinks.map(([label, href]) => (
              <Link key={label} href={href} className="hover:text-ink">
                {label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </main>
  );
}
