import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@emissor/db', '@emissor/logger', '@emissor/validators', '@emissor/focus'],
};

export default nextConfig;
