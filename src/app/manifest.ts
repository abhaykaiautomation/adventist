import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Troy Adventist Academy Preschool",
    short_name: "TAA Preschool",
    description: "Digital admission and student forms for Troy Adventist Academy Preschool.",
    start_url: "/",
    display: "standalone",
    background_color: "#1a1246",
    theme_color: "#241a5e",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
