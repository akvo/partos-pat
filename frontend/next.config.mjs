import dotenv from "dotenv";
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const env = dotenv.config();

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/static/:path*",
        destination: "http://localhost:8000/static/:path*",
      },
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};

export default withNextIntl(nextConfig);
