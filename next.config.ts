import type { NextConfig } from "next";
import os from "node:os";

const envOrigins = (process.env.NEXT_PUBLIC_DEV_ORIGINS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const toHostname = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    return new URL(trimmed).hostname.toLowerCase();
  } catch {
    return trimmed.replace(/^https?:\/\//i, "").split("/")[0].split(":")[0].toLowerCase();
  }
};

const defaultHostnames = ["localhost", "127.0.0.1", "10.255.255.254"];

const localIpv4s = Object.values(os.networkInterfaces())
  .flat()
  .filter((entry) => entry && entry.family === "IPv4" && !entry.internal)
  .map((entry) => entry!.address);

const selectrUrl = process.env.SELECTR_APP_URL || "";
const selectrHostname = selectrUrl ? toHostname(selectrUrl) : "";

const envHostnames = envOrigins.map(toHostname).filter(Boolean);

const wildcardHostnames = [
  "*.ngrok-free.dev",
  "*.ngrok.io",
  "*.ngrok.app",
];

const allowedDevOrigins = Array.from(
  new Set([
    ...defaultHostnames,
    ...localIpv4s,
    ...envHostnames,
    ...(selectrHostname ? [selectrHostname] : []),
    ...wildcardHostnames,
  ])
);

const nextConfig: NextConfig = {
  allowedDevOrigins,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh4.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh5.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh6.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
