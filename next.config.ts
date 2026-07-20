import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://cmjnlpemobqcnjrydyjn.supabase.co').hostname
  } catch {
    return 'cmjnlpemobqcnjrydyjn.supabase.co'
  }
})()

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHost,
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Ensure the OG share-card assets (self-hosted photos + fonts) are bundled
  // into the serverless function so a runtime render (a category added after
  // the last build) can still read them from disk.
  outputFileTracingIncludes: {
    '/c/[communitySlug]/[categorySlug]/opengraph-image': [
      './public/og/**',
      './assets/fonts/**',
    ],
  },
};

export default nextConfig;
