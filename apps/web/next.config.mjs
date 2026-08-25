/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ['@neptlium/ui'],
  async redirects() {
    return [
      { source: '/capital-account', destination: '/products/capital-account', permanent: true },
      { source: '/treasury', destination: '/products/treasury', permanent: true },
      { source: '/allocation', destination: '/products/allocation', permanent: true },
      {
        source: '/portfolio-intelligence',
        destination: '/products/portfolio-intelligence',
        permanent: true,
      },
      { source: '/performance', destination: '/products/performance', permanent: true },
      { source: '/capital-universe', destination: '/products/capital-universe', permanent: true },
      { source: '/capital-activity', destination: '/products/capital-account', permanent: true },
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
