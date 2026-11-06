import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL ?? "https://dealership.vercel.app";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/inbox", "/admin", "/login", "/test-drive/confirmed"] },
    sitemap: `${base}/sitemap.xml`,
  };
}