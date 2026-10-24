export default function InvestLoading() {
  return (
    <div className="op-stack invest-catalog" aria-busy="true" aria-live="polite">
      <p className="sr-only">Loading Neptlium Invest</p>
      <div className="invest-skeleton invest-skeleton-header" />
      <div className="invest-skeleton invest-skeleton-filters" />
      <div className="invest-grid" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="invest-skeleton invest-skeleton-card" />
        ))}
      </div>
    </div>
  );
}
