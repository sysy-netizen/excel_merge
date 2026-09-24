/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/tools/excel-converter",
  // basePath 때문에 vercel.app 루트(/)는 404가 되므로, 루트 접속은 앱 경로로 보낸다.
  async redirects() {
    return [
      { source: "/", destination: "/tools/excel-converter", basePath: false, permanent: false },
    ];
  },
};

module.exports = nextConfig;
