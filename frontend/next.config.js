/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Allow builds to succeed even with type warnings during development.
    // CI should enforce strict checks via `tsc --noEmit`.
    ignoreBuildErrors: false,
  },
  eslint: {
    // Lint during builds — disable only if CI handles it separately.
    ignoreDuringBuilds: false,
  },
}
module.exports = nextConfig
