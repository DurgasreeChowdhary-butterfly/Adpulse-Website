/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Add your CDN / CMS image host here when content moves to a backend.
    remotePatterns: [],
  },
  experimental: {
    // Files read from disk at runtime must be bundled into the serverless functions (Vercel).
    outputFileTracingIncludes: {
      '/api/admin/media': ['./public/images/**/*'],
      '/admin/[section]': ['./public/icons.svg'],
    },
  },
};

export default nextConfig;
