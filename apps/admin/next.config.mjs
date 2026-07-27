/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@neptlium/lib",
    "@neptlium/ui",
    "@neptlium/types",
    "@neptlium/design-system"
  ],
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3002", "app.neptlium.com", "*.app.github.dev"]
    }
  }
};

export default nextConfig;
