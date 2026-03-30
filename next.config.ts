import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",   // produces a fully static `out/` folder — no Node.js needed to serve
  trailingSlash: true, // ensures clean paths on static file servers (IIS, nginx, S3)
};

export default nextConfig;
