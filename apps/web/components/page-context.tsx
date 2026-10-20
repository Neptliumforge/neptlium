import Link from 'next/link';
import { Section, SectionHeader } from '@/components/section';
import { PAGE_CONTEXT, type PageContextRoute } from '@/lib/content/page-context';

/** Route-owned explanations stay server rendered and require no user tracking. */
export function PageContext({ route }: { route: PageContextRoute }) {
  const content = PAGE_CONTEXT[route];
  return (
    <Section tone="surface" aria-label={content.title}>
      <SectionHeader title={content.title} description={content.introduction} />
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        {content.sections.map((section) => (
          <article key={section.title}>
            <h3 className="text-lg font-semibold text-text">{section.title}</h3>
            <p className="mt-3 text-base leading-relaxed text-muted">{section.body}</p>
          </article>
        ))}
      </div>
      <h2 className="mt-12 text-2xl font-semibold text-text">Questions and next steps</h2>
      <dl className="mt-6 flex flex-col gap-8">
        {content.questions.map(({ question, answer }) => (
          <div key={question} className="border-t border-border pt-6">
            <dt className="font-semibold text-text">{question}</dt>
            <dd className="mt-3 max-w-3xl text-base leading-relaxed text-muted">{answer}</dd>
          </div>
        ))}
      </dl>
      <nav aria-label="Related information" className="mt-10 flex flex-wrap gap-6">
        {content.links.map(({ label, href }) => (
          <Link key={href} href={href} className="inline-flex min-h-11 items-center text-text underline underline-offset-4">{label}</Link>
        ))}
      </nav>
    </Section>
  );
}
