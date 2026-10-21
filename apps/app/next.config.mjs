// Legal documents are owned by the public site (apps/web). Relative links to
// them inside the app (for example onboarding consent) resolve against
// app.neptlium.com, so hand those paths to neptlium.com instead of 404ing.
export const PUBLIC_SITE_ORIGIN = "https://neptlium.com";
export const PUBLIC_LEGAL_PATHS = [
  "/legal",
  "/terms",
  "/privacy",
  "/risk-disclosure",
  "/e-delivery",
  "/cookie-policy",
  "/aml-kyc",
  "/complaints",
  "/accessibility"
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return PUBLIC_LEGAL_PATHS.map((source) => ({
      source,
      destination: `${PUBLIC_SITE_ORIGIN}${source}`,
      permanent: false
    }));
  },
  transpilePackages: [
    "@neptlium/lib",
    "@neptlium/ui",
    "@neptlium/types",
    "@neptlium/design-system"
  ],
  experimental: {
    serverActions: {
      // Server Actions compare the request's Origin header against the safelist
      // below. In this dev environment the browser's Origin can show up as either
      // localhost (proxied) or the forwarded Codespaces hostname (direct), so both
      // sides of that mismatch need to be allowed.
      allowedOrigins: ["localhost:3001", "*.app.github.dev"]
    }
  }
};

export default nextConfig;
