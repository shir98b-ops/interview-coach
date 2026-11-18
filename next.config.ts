import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  experimental: {
    // Resumes are uploaded through a server action; allow up to 4 MB files
    // plus form overhead (Vercel caps request bodies at 4.5 MB).
    serverActions: { bodySizeLimit: "4.4mb" },
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
