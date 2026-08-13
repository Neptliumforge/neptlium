import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import test from 'node:test';

process.env.NODE_ENV = 'production';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-public-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-server-key';
process.env.API_ALLOWED_ORIGINS = 'https://app.neptlium.com,https://admin.neptlium.com';
const { default: productionHandler } = await import('../api/index.js');

function request(method, url, headers = {}) {
  const req = Readable.from([]);
  req.method = method;
  req.url = url;
  req.headers = headers;
  req.socket = { remoteAddress: '127.0.0.1' };
  return req;
}

function response() {
  let resolve;
  const completed = new Promise((done) => { resolve = done; });
  return {
    statusCode: undefined,
    headers: undefined,
    body: undefined,
    writeHead(statusCode, headers) { this.statusCode = statusCode; this.headers = headers; },
    end(body = '') { this.body = String(body); resolve(); },
    completed,
  };
}

test('production entrypoint routes unauthenticated admin session to explicit 401, never 404', async () => {
  const res = response();
  await productionHandler(request('GET', '/v1/admin/session'), res);
  await res.completed;
  assert.equal(res.statusCode, 401);
  assert.equal(JSON.parse(res.body).error.code, 'authentication_required');
});

test('production entrypoint preserves admin CORS preflight fast path', async () => {
  const res = response();
  await productionHandler(
    request('OPTIONS', '/v1/admin/session', {
      origin: 'https://admin.neptlium.com',
      'access-control-request-method': 'GET',
    }),
    res,
  );
  await res.completed;
  assert.equal(res.statusCode, 204);
  assert.equal(res.headers['access-control-allow-origin'], 'https://admin.neptlium.com');
  assert.notEqual(res.headers['access-control-allow-origin'], '*');
});
