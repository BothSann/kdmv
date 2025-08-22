/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "medias.jeanpaulgaultier.com",
      },
      {
        protocol: "https",
        hostname: "zandokh.com",
      },
    ],
  },
};
