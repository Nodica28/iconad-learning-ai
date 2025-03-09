/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable the built-in image optimization that uses Sharp
  // This will prevent the Sharp-related errors during deployment
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
