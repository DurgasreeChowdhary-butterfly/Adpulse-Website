/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Add your CDN / CMS image host here when content moves to a backend.
    remotePatterns: [],
  },
  // Files read from disk at runtime are traced into the server output (needed for serverless hosts and standalone builds).
  outputFileTracingIncludes: {
    '/api/admin/media': ['./public/images/**/*'],
    '/admin/[section]': ['./public/icons.svg'],
  },
};

export default nextConfig;
