import type { NextConfig } from "next";
import { getSupabaseStorageHostname } from "./src/lib/supabase/storage";

const supabaseHostname = getSupabaseStorageHostname();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  async headers() {
    const securityHeaders = [
      {
        source: "/:path*",
        headers: [
          ...(process.env.NODE_ENV === "production"
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];

    if (process.env.NODE_ENV !== "production") {
      return securityHeaders;
    }

    return [
      ...securityHeaders,
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/:path*.:extension(ico|png|jpg|jpeg|webp|svg|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Framing contractor — primary category
      { source: "/services/framing", destination: "/services/framing-contractor/residential-framing", permanent: true },
      {
        source: "/services/general-contracting",
        destination: "/services/framing-contractor/residential-framing",
        permanent: true,
      },
      { source: "/services/general-contractor", destination: "/services/framing-contractor", permanent: true },
      {
        source: "/services/general-contractor/:path*",
        destination: "/services/framing-contractor/:path*",
        permanent: true,
      },
      { source: "/services/remodeler", destination: "/services/framing-contractor/remodel-framing", permanent: true },
      {
        source: "/services/remodeler/:path*",
        destination: "/services/framing-contractor/remodel-framing",
        permanent: true,
      },
      // Legacy flat sub-service URLs → nested category/sub-service paths
      {
        source: "/services/home-addition-construction",
        destination: "/services/framing-contractor/home-addition-framing",
        permanent: true,
      },
      {
        source: "/services/custom-home-building",
        destination: "/services/home-builder/custom-home-building",
        permanent: true,
      },
      {
        source: "/services/new-home-construction",
        destination: "/services/home-builder/new-home-construction",
        permanent: true,
      },
      {
        source: "/services/custom-framing",
        destination: "/services/framing-contractor/custom-framing",
        permanent: true,
      },
      {
        source: "/services/home-addition-framing",
        destination: "/services/framing-contractor/home-addition-framing",
        permanent: true,
      },
      {
        source: "/services/production-home-framing",
        destination: "/services/framing-contractor/production-home-framing",
        permanent: true,
      },
      {
        source: "/services/residential-framing",
        destination: "/services/framing-contractor/residential-framing",
        permanent: true,
      },
      {
        source: "/services/commercial-framing",
        destination: "/services/framing-contractor/commercial-framing",
        permanent: true,
      },
      {
        source: "/services/rough-framing",
        destination: "/services/framing-contractor/rough-framing",
        permanent: true,
      },
      {
        source: "/services/structural-framing",
        destination: "/services/framing-contractor/structural-framing",
        permanent: true,
      },
      {
        source: "/services/whole-home-remodeling",
        destination: "/services/framing-contractor/remodel-framing",
        permanent: true,
      },
      {
        source: "/services/kitchen-remodeling",
        destination: "/services/framing-contractor/remodel-framing",
        permanent: true,
      },
      {
        source: "/services/bathroom-remodeling",
        destination: "/services/framing-contractor/remodel-framing",
        permanent: true,
      },
      {
        source: "/services/wood-deck-construction",
        destination: "/services/deck-builder/wood-deck-construction",
        permanent: true,
      },
      {
        source: "/services/deck-replacement",
        destination: "/services/deck-builder/deck-replacement",
        permanent: true,
      },
      {
        source: "/services/siding-installation",
        destination: "/services/siding-contractor/siding-installation",
        permanent: true,
      },
      {
        source: "/services/siding-replacement",
        destination: "/services/siding-contractor/siding-replacement",
        permanent: true,
      },
      {
        source: "/services/fiber-cement-siding",
        destination: "/services/siding-contractor/siding-installation",
        permanent: true,
      },
      {
        source: "/services/residential-construction",
        destination: "/services/home-builder/new-home-construction",
        permanent: true,
      },
      {
        source: "/services/new-building-construction",
        destination: "/services/home-builder/new-home-construction",
        permanent: true,
      },
      {
        source: "/services/construction-company",
        destination: "/services/home-builder",
        permanent: true,
      },
      {
        source: "/services/construction-company/:path*",
        destination: "/services/home-builder/new-home-construction",
        permanent: true,
      },
      // Siding → Siding Contractor
      { source: "/services/siding", destination: "/services/siding-contractor", permanent: true },
      // Decks → Deck Builder
      { source: "/services/decks", destination: "/services/deck-builder", permanent: true },
      { source: "/services/deck-construction", destination: "/services/deck-builder", permanent: true },
      // Home building / additions / luxury / tiny homes → Home Builder
      { source: "/services/home-building", destination: "/services/home-builder", permanent: true },
      {
        source: "/services/luxury-home-building",
        destination: "/services/home-builder",
        permanent: true,
      },
      {
        source: "/services/tiny-home-building",
        destination: "/services/home-builder",
        permanent: true,
      },
      // Remodeling → remodel framing (structural work, not finish remodel)
      { source: "/services/remodeling", destination: "/services/framing-contractor/remodel-framing", permanent: true },
      // Retired outdoor structures → closest active category
      { source: "/services/patio-construction", destination: "/services/deck-builder", permanent: true },
      { source: "/services/fence-building", destination: "/services/deck-builder", permanent: true },
    ];
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
    ],
    serverActions: {
      bodySizeLimit: "256mb",
    },
  },
  images: {
    qualities: [75, 85, 90, 95, 100],
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
