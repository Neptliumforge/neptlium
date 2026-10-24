import { ApiError } from './errors.js';
import {
  catalogDetail,
  catalogListing,
  parseCatalogQuery,
  parseDraftRequest,
  parseTransitionRequest,
} from './invest-catalog-domain.js';
import type { InvestCatalogRepository } from './invest-catalog-repository.js';

type CatalogContext = {
  method: string;
  path: string;
  query: URLSearchParams;
  body: unknown;
};
type RouteResult = { status?: number; data: unknown };

/** Customer catalog reads. Every route requires an authenticated owner. */
export async function handleInvestCatalogRoute(
  context: CatalogContext,
  deps: { repository: InvestCatalogRepository; ownerId: () => Promise<string> },
): Promise<RouteResult | null> {
  const { method, path } = context;
  if (method !== 'GET' || !path.startsWith('/v1/invest/')) return null;

  if (path === '/v1/invest/catalog') {
    await deps.ownerId();
    const query = parseCatalogQuery(context.query);
    return { data: catalogListing(await deps.repository.publishedCatalog(), query, new Date()) };
  }

  if (path === '/v1/invest/sectors') {
    await deps.ownerId();
    return { data: { sectors: await deps.repository.sectors() } };
  }

  const detail = path.match(/^\/v1\/invest\/catalog\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
  if (detail?.[1]) {
    await deps.ownerId();
    const document = (await deps.repository.publishedCatalog()).find(
      (item) => item.slug === detail[1],
    );
    if (!document)
      throw new ApiError(404, 'invest_product_not_found', 'This product is not in the catalog');
    return { data: catalogDetail(document) };
  }

  return null;
}

/**
 * Administrative catalog management. Called from handleAdminRoute after its
 * super_admin check; publication rules and audit are enforced in the database.
 */
export async function handleInvestCatalogAdminRoute(
  context: CatalogContext,
  deps: { repository: InvestCatalogRepository; actorId: string },
): Promise<RouteResult | null> {
  const { method, path } = context;
  if (!path.startsWith('/v1/admin/invest/')) return null;

  if (method === 'GET' && path === '/v1/admin/invest/catalog')
    return { data: { versions: await deps.repository.adminCatalog() } };

  const draft = path.match(/^\/v1\/admin\/invest\/products\/([^/]+)\/versions$/);
  if (method === 'POST' && draft?.[1]) {
    const request = parseDraftRequest(decodeURIComponent(draft[1]), context.body);
    const created = await deps.repository.createDraft({ ...request, actor: deps.actorId });
    return { status: 201, data: created };
  }

  const transition = path.match(
    /^\/v1\/admin\/invest\/versions\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/transition$/,
  );
  if (method === 'POST' && transition?.[1]) {
    const { toStatus, rationale } = parseTransitionRequest(context.body);
    return {
      data: await deps.repository.transition({
        versionId: transition[1],
        actor: deps.actorId,
        toStatus,
        rationale,
      }),
    };
  }

  return null;
}
