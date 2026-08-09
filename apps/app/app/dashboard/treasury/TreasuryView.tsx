import { Money, Section, Stack, Surface } from '@neptlium/ui';

export function TreasuryView() {
  return (
    <Stack className="py-1">
      <header>
        <h1>Treasury</h1>
        <p className="mt-1 text-sm text-text-muted">Liquidity and capital readiness.</p>
      </header>
      <section className="grid grid-cols-3 gap-3 border-y border-border-hairline py-5">
        {['Available liquidity', 'Reserve', 'Committed'].map((label) => (
          <div key={label} className="min-w-0">
            <p className="text-xs text-text-muted">{label}</p>
            <Money
              state="unavailable"
              className="mt-2 block text-lg font-medium text-text-primary"
            />
          </div>
        ))}
      </section>
      <Section title="Liquidity position">
        <Surface className="px-5 py-8 text-center">
          <p className="text-sm font-medium">No treasury activity yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-text-muted">
            Treasury information will appear as capital enters your account.
          </p>
        </Surface>
      </Section>
    </Stack>
  );
}
