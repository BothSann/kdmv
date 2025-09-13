/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rbcppmhhbzilsypviyrg.supabase.co",
        pathname: "/storage/v1/object/public/clothes-images/**",
      },
      {
        protocol: "https",
        hostname: "rbcppmhhbzilsypviyrg.supabase.co",
        pathname: "/storage/v1/object/public/avatars/**",
      },
    ],
  },
};

export default nextConfig;
