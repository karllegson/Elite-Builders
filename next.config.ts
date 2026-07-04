import type { NextConfig } from "next";
import { getSupabaseStorageHostname } from "./src/lib/supabase/storage";

const supabaseHostname = getSupabaseStorageHostname();

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Framing is now a featured specialty under General Contractor.
      { source: "/services/framing", destination: "/services/general-contractor", permanent: true },
      {
        source: "/services/general-contracting",
        destination: "/services/general-contractor",
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
        source: "/services/home-addition-construction",
        destination: "/services/home-builder",
        permanent: true,
      },
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
      // Remodeling → Remodeler
      { source: "/services/remodeling", destination: "/services/remodeler", permanent: true },
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
