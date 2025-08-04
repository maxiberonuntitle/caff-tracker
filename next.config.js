/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  webpack: (config, { isServer }) => {
    // Resolver conflictos de módulos
    config.resolve.alias = {
      ...config.resolve.alias,
      'd3-scale': require.resolve('d3-scale'),
      'd3-shape': require.resolve('d3-shape'),
      'd3-array': require.resolve('d3-array'),
      'd3-time': require.resolve('d3-time'),
      'd3-time-format': require.resolve('d3-time-format'),
      'd3-color': require.resolve('d3-color'),
      'd3-interpolate': require.resolve('d3-interpolate'),
      'd3-ease': require.resolve('d3-ease'),
    };

    // Configurar preferRelative para resolver módulos locales
    config.resolve.preferRelative = true;

    return config;
  },
  transpilePackages: ['recharts', 'victory-vendor', 'use-sidecar', 'react-remove-scroll'],
};

module.exports = nextConfig;
