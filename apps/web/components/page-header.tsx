import { Breadcrumb, type Crumb } from '@/components/breadcrumb';

export function PageHeader({
  eyebrow,
  title,
  intro,
  crumbs,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  crumbs?: Crumb[];
}) {
  return (
    <section className="border-b border-line bg-background">
      <div className="container-page py-14 md:py-20 lg:py-24">
        {crumbs && <Breadcrumb items={crumbs} />}
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-ink md:text-4xl lg:text-[3rem]">
          {title}
        </h1>
        {intro && (
          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted md:text-lg">
            {intro}
          </p>
        )}
      </div>
    </section>
  );
}
