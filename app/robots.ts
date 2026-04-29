import type { MetadataRoute } from "next";
import { env } from "@/lib/config/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/advertiser/", "/fleet/", "/sign-in", "/sign-up"]
    },
    sitemap: `${env.APP_URL}/sitemap.xml`
  };
}
