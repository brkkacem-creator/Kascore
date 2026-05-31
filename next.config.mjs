/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
    unoptimized: process.env.BUILD_TARGET === 'android',
  },
  // Static export only for Capacitor APK build
  ...(process.env.BUILD_TARGET === 'android' && {
    output: 'export',
    trailingSlash: true,
  }),
};

export default nextConfig;
