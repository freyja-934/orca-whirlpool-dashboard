import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    
    // Handle WASM files
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });
    
    // For server-side, we need to handle the WASM file path differently
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@orca-so/whirlpools-core": false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
