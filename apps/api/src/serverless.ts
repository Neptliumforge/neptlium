import type { IncomingMessage, ServerResponse } from 'node:http';
import { buildApp, type InjectionResponse } from './app.js';
import { loadConfig } from './config.js';
import { SupabaseRepository } from './supabase-repository.js';
import { MemoryRateLimiter } from './security.js';

type CanonicalApplication = {
  inject(input: {
    method: string;
    url: string;
    headers: Record<string, string>;
    payload?: string;
    clientAddress: string;
  }): Promise<InjectionResponse>;
};

export function createServerlessHandler(application: Promise<CanonicalApplication>) {
  return async function handler(req: IncomingMessage, res: ServerResponse) {
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of req) {
      const buffer = Buffer.from(chunk);
      size += buffer.length;
      if (size > 1_048_576) {
        res.writeHead(413, { 'content-type': 'application/json; charset=utf-8' });
        res.end(
          JSON.stringify({
            error: { code: 'payload_too_large', message: 'Request body exceeds 1 MiB' },
          }),
        );
        return;
      }
      chunks.push(buffer);
    }
    const app = await application;
    const response = await app.inject({
      method: req.method ?? 'GET',
      url: req.url ?? '/',
      headers: Object.fromEntries(
        Object.entries(req.headers).flatMap(([key, value]) =>
          typeof value === 'string' ? [[key, value]] : [],
        ),
      ),
      ...(chunks.length ? { payload: Buffer.concat(chunks).toString('utf8') } : {}),
      clientAddress: req.socket.remoteAddress ?? 'serverless',
    });
    res.writeHead(response.statusCode, response.headers);
    res.end(response.body);
  };
}

async function buildProductionApplication() {
  const config = loadConfig();
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY || !config.SUPABASE_SERVICE_ROLE_KEY)
    throw new Error('Production serverless runtime requires durable Supabase credentials');
  return buildApp({
    config,
    repository: new SupabaseRepository(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY),
    rateLimiter: new MemoryRateLimiter(),
  });
}

let productionHandler: ReturnType<typeof createServerlessHandler> | undefined;
export async function serverlessHandler(req: IncomingMessage, res: ServerResponse) {
  productionHandler ??= createServerlessHandler(buildProductionApplication());
  return productionHandler(req, res);
}
