/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/tools/excel-converter",
  // Python 서버리스 함수(/api/*)는 basePath 밖에 있으므로, 화면이 호출하는
  // /tools/excel-converter/api/* 를 /api/* 로 연결한다.
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/tools/excel-converter/api/:path*", destination: "/api/:path*", basePath: false },
      ],
    };
  },
  // basePath 때문에 vercel.app 루트(/)는 404가 되므로, 루트 접속은 앱 경로로 보낸다.
  async redirects() {
    return [
      { source: "/", destination: "/tools/excel-converter", basePath: false, permanent: false },
    ];
  },
};

module.exports = nextConfig;
