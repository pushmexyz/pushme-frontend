/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Performance optimizations for dev mode
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during dev for faster startup
  },
  typescript: {
    ignoreBuildErrors: false, // Keep type checking but don't block builds
  },
  
  // Webpack config (only used when NOT using Turbopack)
  webpack: (config, { isServer, dev }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Fix webpack cache issues in dev mode
    if (dev) {
      // Disable persistent cache temporarily to avoid ENOENT errors
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }

    // Suppress warnings for optional dependencies (pino-pretty is optional)
    const originalWarnings = config.ignoreWarnings || [];
    config.ignoreWarnings = [
      ...originalWarnings,
      {
        module: /node_modules\/pino\/lib\/tools\.js/,
      },
      {
        message: /Can't resolve 'pino-pretty'/,
      },
    ];

    return config;
  },
  
  // Suppress console warnings during build
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  
  // Turbopack configuration
  experimental: {
    turbo: {
      resolveAlias: {
        // Add any alias configurations if needed
      },
    },
  },
};

module.exports = nextConfig;

