import Link from 'next/link';
import { Brand } from '@/components/brand';

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
  return (
    <main className="min-h-[70vh] bg-surface-subtle px-6 py-16 md:py-24">
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-background p-7 shadow-sm md:p-10">
        <Brand />
        <p className="eyebrow mt-12">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">{title}</h1>
        <p className="mt-4 leading-relaxed text-muted">{intro}</p>
        <div className="mt-8 grid gap-3">
          {action !== 'Return to Neptlium' && (
            <button className="button w-full justify-center" type="button">
              {action}
            </button>
          )}
          {action === 'Return to Neptlium' && (
            <Link className="button w-full justify-center" href="/">
              {action}
            </Link>
          )}
        </div>
        {links.length > 0 && (
          <nav
            className="mt-7 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted"
            aria-label="Authentication links"
          >
            {links.map(([label, href]) => (
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
