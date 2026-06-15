/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export only at build time; dev renders dynamic routes normally.
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
