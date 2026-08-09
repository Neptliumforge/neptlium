import { NeptliumMark } from '../../(auth)/components/NeptliumMark';

export function OnboardingHeader() {
  return (
    <header className="flex h-16 items-center justify-center border-b border-border-hairline px-4">
      <div className="flex items-center gap-2.5" aria-label="Neptlium">
        <NeptliumMark size={22} />
        <span className="text-sm font-semibold tracking-[0.08em] text-text-primary">NEPTLIUM</span>
      </div>
    </header>
  );
}
