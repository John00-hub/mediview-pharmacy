import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mediview Pharmacy — Wellness & Lifestyle",
    short_name: "Mediview",
    description:
      "Browse medicines and wellness products, request current prices and availability from Mediview Pharmacy, Wuse 2 Abuja.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f4",
    theme_color: "#143d2b",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
