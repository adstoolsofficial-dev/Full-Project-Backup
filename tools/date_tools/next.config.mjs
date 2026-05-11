/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 🌟 هذا هو السطر السحري الذي سيقوم بإنشاء مجلد out
  trailingSlash: true,
  images: {
    unoptimized: true,
  }
};

export default nextConfig;