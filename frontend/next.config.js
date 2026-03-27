/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  /* ── CesiumJS Configuration ──
     Cesium workers/assets are loaded from CDN at runtime.
     No webpack copy needed — avoids ESM minification conflicts. */
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        url: false,
      };

      // Exclude Cesium workers from webpack processing
      config.module.rules.push({
        test: /\.js$/,
        include: /cesium[\\/]Build/,
        type: "javascript/auto",
      });
    }
    return config;
  },
};

module.exports = nextConfig;
