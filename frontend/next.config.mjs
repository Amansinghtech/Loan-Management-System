/** @type {import('next').NextConfig} */

// The browser always talks to the Next.js app's own origin under `/api`, and
// Next proxies those requests to the real backend. This keeps the auth cookie
// first-party (same site as the frontend), so the Edge middleware can read it
// and cross-site cookie/CORS problems disappear in production.
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? 'http://localhost:5000';

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
