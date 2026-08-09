import { Breadcrumb, type Crumb } from '@/components/breadcrumb'

export function PageHeader({
  eyebrow,
  title,
  intro,
  crumbs,
}: {
  eyebrow?: string
  title: string
  intro?: string
  crumbs?: Crumb[]
}) {
  return (
    <section className="border-b border-line bg-background">
      <div className="container-page py-14 md:py-20 lg:py-24">
        {crumbs && <Breadcrumb items={crumbs} />}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className={`${eyebrow ? 'mt-4' : 'mt-6'} page-title max-w-3xl text-balance text-ink`}>
          {title}
        </h1>
        {intro && (
          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted md:text-lg">
            {intro}
          </p>
        )}
      </div>
    </section>
  )
}
