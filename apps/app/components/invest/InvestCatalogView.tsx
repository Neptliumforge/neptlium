import Link from 'next/link';
import { ArrowRight, Info, Search } from 'lucide-react';
import type { InvestCatalogItem, InvestCatalogListing, InvestSectorRecord } from '@/lib/api/invest';
import {
  availabilityPresentation,
  catalogFilterOptions,
  familyPresentation,
  groupByFamily,
  termsSummary,
} from './catalog-presentation';

export interface CatalogFilters {
  readonly q: string;
  readonly family: string;
  readonly availability: string;
  readonly sector: string;
  readonly sort: string;
}

export function AvailabilityBadge({ availability }: { readonly availability: InvestCatalogItem['availability'] }) {
  const presentation = availabilityPresentation[availability];
  return (
    <span className={`invest-badge invest-badge-${presentation.tone}`}>
      <strong>{presentation.label}</strong>
      <span>{presentation.detail}</span>
    </span>
  );
}

function CatalogCard({ item }: { readonly item: InvestCatalogItem }) {
  const terms = termsSummary(item.terms);
  const headingId = `invest-card-${item.slug}`;
  return (
    <article className="invest-card" aria-labelledby={headingId}>
      <div className="invest-card-top">
        <span className="invest-card-family">{familyPresentation[item.family].label}</span>
        <AvailabilityBadge availability={item.availability} />
      </div>
      <h3 id={headingId}>
        <Link href={`/dashboard/invest/${item.slug}`} className="invest-card-link">
          {item.name}
        </Link>
      </h3>
      <p className="invest-card-tagline">{item.tagline}</p>
      {terms ? <p className="invest-card-terms">{terms} · not final</p> : null}
      {item.sectors.length ? (
        <ul className="invest-chips" aria-label={`${item.name} research sectors`}>
          {item.sectors.slice(0, 3).map((sector) => (
            <li key={sector.slug}>{sector.name}</li>
          ))}
          {item.sectors.length > 3 ? <li>+{item.sectors.length - 3}</li> : null}
        </ul>
      ) : null}
      <span className="invest-card-cta" aria-hidden="true">
        View details <ArrowRight size={14} />
      </span>
    </article>
  );
}

function CatalogFiltersForm({
  filters,
  sectors,
}: {
  readonly filters: CatalogFilters;
  readonly sectors: readonly InvestSectorRecord[];
}) {
  return (
    <form className="invest-filters" action="/dashboard/invest" method="get" role="search" aria-label="Search the catalog">
      <label className="invest-field invest-field-search">
        <span>Search</span>
        <span className="invest-search-input">
          <Search size={15} aria-hidden="true" />
          <input
            type="search"
            name="q"
            defaultValue={filters.q}
            maxLength={80}
            placeholder="Plans, themes or sectors such as semiconductors"
          />
        </span>
      </label>
      <label className="invest-field">
        <span>Product type</span>
        <select name="family" defaultValue={filters.family}>
          {catalogFilterOptions.family.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <label className="invest-field">
        <span>Availability</span>
        <select name="availability" defaultValue={filters.availability}>
          {catalogFilterOptions.availability.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <label className="invest-field">
        <span>Research sector</span>
        <select name="sector" defaultValue={filters.sector}>
          <option value="">All sectors</option>
          {sectors.map((sector) => (
            <option key={sector.slug} value={sector.slug}>{sector.name}</option>
          ))}
        </select>
      </label>
      <label className="invest-field">
        <span>Sort by</span>
        <select name="sort" defaultValue={filters.sort || 'featured'}>
          {catalogFilterOptions.sort.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <div className="invest-filter-actions">
        <button type="submit" className="op-button op-button-primary">Apply</button>
        <Link href="/dashboard/invest" className="op-button">Reset</Link>
      </div>
    </form>
  );
}

export function InvestHeader() {
  return (
    <header className="op-page-header invest-header">
      <div>
        <p className="op-eyebrow">Invest</p>
        <h1>Neptlium Invest</h1>
        <p>
          Managed-plan concepts and research collections, each with its exact availability. Investing
          is not open yet.
        </p>
      </div>
    </header>
  );
}

export function InvestStatusNote() {
  return (
    <aside className="invest-status-note" aria-label="Investing availability">
      <Info size={16} aria-hidden="true" />
      <p>
        <strong>Investing is not available yet.</strong> Plans are concepts under development and
        collections are research only. Nothing here is an offer, a recommendation or a promise of
        return.
      </p>
    </aside>
  );
}

export function InvestCatalogView({
  listing,
  sectors,
  filters,
}: {
  readonly listing: InvestCatalogListing;
  readonly sectors: readonly InvestSectorRecord[];
  readonly filters: CatalogFilters;
}) {
  const filtered = Boolean(filters.q || filters.family || filters.availability || filters.sector);
  const grouped = !filtered && (filters.sort || 'featured') === 'featured';

  return (
    <div className="op-stack invest-catalog">
      <InvestHeader />
      <InvestStatusNote />
      <CatalogFiltersForm filters={filters} sectors={sectors} />

      {listing.published_total === 0 ? (
        <section className="op-panel invest-empty" aria-labelledby="invest-empty-title">
          <h2 id="invest-empty-title">The catalog is being prepared</h2>
          <p>
            Plans and research collections appear here once they have been reviewed and published.
            Nothing is available to invest in.
          </p>
        </section>
      ) : listing.total === 0 ? (
        <section className="op-panel invest-empty" aria-labelledby="invest-empty-title">
          <h2 id="invest-empty-title">No products match</h2>
          <p>Try a different search or remove a filter.</p>
          <Link href="/dashboard/invest" className="op-inline-link">
            Clear search and filters <ArrowRight size={14} />
          </Link>
        </section>
      ) : grouped ? (
        groupByFamily(listing.items).map((group) => (
          <section key={group.family} className="invest-group" aria-labelledby={`invest-group-${group.family}`}>
            <div className="invest-group-heading">
              <h2 id={`invest-group-${group.family}`}>{familyPresentation[group.family].plural}</h2>
              <p>{familyPresentation[group.family].description}</p>
            </div>
            <div className="invest-grid">
              {group.items.map((item) => (
                <CatalogCard key={item.slug} item={item} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <section className="invest-group" aria-labelledby="invest-results-title">
          <div className="invest-group-heading">
            <h2 id="invest-results-title">
              {listing.total} {listing.total === 1 ? 'result' : 'results'}
            </h2>
          </div>
          <div className="invest-grid">
            {listing.items.map((item) => (
              <CatalogCard key={item.slug} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function InvestUnavailable({ retryHref }: { readonly retryHref: string }) {
  return (
    <section className="op-panel invest-empty" role="alert" aria-labelledby="invest-unavailable-title">
      <h2 id="invest-unavailable-title">The catalog is temporarily unavailable</h2>
      <p>We could not load Neptlium Invest. Nothing has changed in your account.</p>
      <Link href={retryHref} className="op-inline-link">
        Try again <ArrowRight size={14} />
      </Link>
    </section>
  );
}
