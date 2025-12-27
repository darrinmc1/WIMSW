import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable gzip compression
  compress: true,
  images: {
    remotePatterns: [
      // E-commerce platforms
      {
        protocol: 'https',
        hostname: 'ebay.com',
      },
      {
        protocol: 'https',
        hostname: '*.ebay.com',
      },
      {
        protocol: 'https',
        hostname: 'poshmark.com',
      },
      {
        protocol: 'https',
        hostname: '*.poshmark.com',
      },
      {
        protocol: 'https',
        hostname: 'mercari.com',
      },
      {
        protocol: 'https',
        hostname: '*.mercari.com',
      },
      {
        protocol: 'https',
        hostname: 'depop.com',
      },
      {
        protocol: 'https',
        hostname: '*.depop.com',
      },
      {
        protocol: 'https',
        hostname: 'facebook.com',
      },
      {
        protocol: 'https',
        hostname: '*.facebook.com',
      },
      {
        protocol: 'https',
        hostname: 'offerup.com',
      },
      {
        protocol: 'https',
        hostname: '*.offerup.com',
      },
      {
        protocol: 'https',
        hostname: 'craigslist.org',
      },
      {
        protocol: 'https',
        hostname: '*.craigslist.org',
      },
      {
        protocol: 'https',
        hostname: 'gumtree.com',
      },
      {
        protocol: 'https',
        hostname: '*.gumtree.com',
      },
      // Common CDNs for product images
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
    ],
    // Note: User-uploaded images are handled via base64 data URLs, not remote URLs
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=self; microphone=()', // Camera needed for upload
          },
          {
            key: 'Content-Security-Policy',
            value: [
              // Default: only allow from same origin
              "default-src 'self'",
              // Scripts: Next.js requires 'unsafe-eval' and 'unsafe-inline' in dev mode
              // In production, Next.js uses hashed scripts
              process.env.NODE_ENV === 'production'
                ? "script-src 'self' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com"
                : "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com",
              // Styles: Tailwind and Radix UI use inline styles, Framer Motion needs inline
              "style-src 'self' 'unsafe-inline'",
              // Images: allow data URIs for user uploads + e-commerce CDNs
              "img-src 'self' data: blob: https://*.ebay.com https://*.poshmark.com https://*.mercari.com https://*.depop.com https://*.facebook.com https://*.offerup.com https://*.craigslist.org https://*.gumtree.com https://images.unsplash.com https://cdn.shopify.com https://*.cloudinary.com https://vercel.live",
              // Fonts: only from same origin
              "font-src 'self' data:",
              // Connect: API calls + Vercel Analytics + Sentry
              "connect-src 'self' https://vercel.live https://va.vercel-scripts.com https://*.sentry.io https://o4508204448866304.ingest.us.sentry.io",
              // Media: allow from same sources as images
              "media-src 'self' data: blob:",
              // Objects/embeds: disallow plugins
              "object-src 'none'",
              // Base URI: restrict to same origin
              "base-uri 'self'",
              // Form actions: only submit to same origin
              "form-action 'self'",
              // Frame ancestors: already set via X-Frame-Options but add here too
              "frame-ancestors 'none'",
              // Upgrade insecure requests in production
              process.env.NODE_ENV === 'production' ? 'upgrade-insecure-requests' : '',
            ]
              .filter(Boolean)
              .join('; '),
          },
        ],
      },
    ];
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
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      'date-fns',
      'framer-motion',
    ],
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

export default withSentryConfig(nextConfig, sentryOptions);
