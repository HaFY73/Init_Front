import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // 환경별 API URL 설정
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: `${process.env.BACKEND_URL || "http://localhost:8080"}/api/:path*`
            }
        ]
    },

    // 환경 변수 설정
    env: {
        BACKEND_URL: process.env.BACKEND_URL || "http://localhost:8080",
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
    },

    // 이미지 최적화 설정 (업로드된 이미지용)
    images: {
        domains: ['localhost'],
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8080',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: '**', // 프로덕션용 이미지 도메인
            }
        ],
    },

    // 보안 헤더 설정
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    {
                        key: "Access-Control-Allow-Origin",
                        value: "http://localhost:3000"
                    },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET, POST, PUT, DELETE, PATCH, OPTIONS"
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "Content-Type, Authorization, X-User-Id"
                    },
                    {
                        key: "Access-Control-Allow-Credentials",
                        value: "true"
                    }
                ]
            }
        ]
    }
};

export default nextConfig;