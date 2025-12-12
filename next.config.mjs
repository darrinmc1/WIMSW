import { withSentryConfig } from '@sentry/nextjs';
import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Performance optimizations
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Experimental features for better performance
  experimental: {
    // Optimize package imports for commonly used libraries
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Bundle analyzer (run with ANALYZE=true npm run build)
  webpack: (config, { isServer }) => {
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
          openAnalyzer: false,
        })
      );
    }
    return config;
  },
}

// Sentry configuration options
const sentryOptions = {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the Sentry DSN is configured before enabling this.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Webpack-specific configuration
  webpack: {
    // Automatically tree-shake Sentry logger statements to reduce bundle size
    treeshake: {
      removeDebugLogging: true,
    },
    // Enables automatic instrumentation of Vercel Cron Monitors
    automaticVercelMonitors: true,
  },
};

export default bundleAnalyzer(withSentryConfig(nextConfig, sentryOptions));
