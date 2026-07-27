import { CreateAccountLink, SignInLink } from '@/components/account-links'

export function CtaBand({
  title = 'Bring your capital into one clearer operating view.',
  body = 'Organize your portfolio, understand allocation and prepare capital decisions with greater structure, visibility and control.',
}: {
  title?: string
  body?: string
}) {
  return (
    <section className="bg-navigation text-inverse">
      <div className="container-page py-[72px] md:py-20 lg:py-24">
        <div className="max-w-2xl">
          <h2 className="text-balance text-2xl font-semibold leading-tight tracking-tight text-inverse md:text-3xl lg:text-[2rem]">
            {title}
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-inverse/70 md:text-lg">
            {body}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <CreateAccountLink variant="accent" />
            <SignInLink variant="outline-inverse" />
          </div>
        </div>
      </div>
    </section>
  )
}
