import type { NextConfig } from "next";
import { env } from "@/lib/config/env";

const allowedImageHosts = [
  new URL(env.APP_URL).hostname,
  ...env.SECURITY_ALLOWED_IMAGE_HOSTS.split(",").map((item) => item.trim()).filter(Boolean)
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: allowedImageHosts.map((hostname) => ({
      protocol: hostname === "localhost" || hostname.startsWith("127.") ? "http" : "https",
      hostname
    }))
  }
};

export default nextConfig;
