// server.ts, middleware.ts, and admin.ts are intentionally not re-exported here —
// they import next/headers / next/server, which breaks client and Edge bundles
// if pulled in through this barrel. Import them via their explicit subpaths:
// @neptlium/lib/supabase/server, @neptlium/lib/supabase/middleware, @neptlium/lib/supabase/admin
export * from "./browser";
