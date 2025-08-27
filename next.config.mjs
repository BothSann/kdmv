/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "viwhmgjnrbkaehahrquo.supabase.co",
        pathname: "/storage/v1/object/public/clothes-images/**",
      },
    ],
  },
};

export default nextConfig;
