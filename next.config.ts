import type { NextConfig } from "next";
import { getSupabaseStorageHostname } from "./src/lib/supabase/storage";

const supabaseHostname = getSupabaseStorageHostname();

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/services/framing", destination: "/services/home-building", permanent: true },
      { source: "/services/siding", destination: "/services/home-building", permanent: true },
      { source: "/services/decks", destination: "/services/deck-construction", permanent: true },
      {
        source: "/services/general-contracting",
        destination: "/services/home-building",
        permanent: true,
      },
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
