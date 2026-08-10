import { Breadcrumb, type Crumb } from '@/components/breadcrumb';

export function PageHeader({
  eyebrow,
  title,
  intro,
  crumbs,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  crumbs?: Crumb[];
}) {
  return (
    <section className="route-page-header">
      <div className="container-page route-page-header-inner">
        {crumbs && <Breadcrumb items={crumbs} />}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {intro && <p className="route-page-intro">{intro}</p>}
      </div>
    </section>
  );
}
