/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ['@neptlium/ui'],
  async redirects() {
    return [
      { source: '/docs', destination: 'https://docs.neptlium.com', permanent: true },
      { source: '/status', destination: 'https://status.neptlium.com', permanent: true },
      { source: '/resources', destination: '/insights', permanent: true },
      { source: '/capital-account', destination: '/capital', permanent: true },
      { source: '/portfolio-intelligence', destination: '/portfolio', permanent: true },
      { source: '/products/capital-account', destination: '/capital', permanent: true },
      { source: '/products/treasury', destination: '/treasury', permanent: true },
      { source: '/products/allocation', destination: '/allocation', permanent: true },
      { source: '/products/portfolio-intelligence', destination: '/portfolio', permanent: true },
      { source: '/performance', destination: '/products/performance', permanent: true },
      { source: '/capital-universe', destination: '/products/capital-universe', permanent: true },
      { source: '/capital-activity', destination: '/capital', permanent: true },
      { source: '/neptlium-link', destination: '/platform', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
