/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.api.idbazaar.topntech.com",
        port: "",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
