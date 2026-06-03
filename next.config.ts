import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: false, // Diubah ke true agar build tidak gagal jika terdapat warning/error tipe data pada Cloud Run
    },
    // Allow access to remote image placeholder.
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                port: '',
                pathname: '/**', // This allows any path under the hostname
            },
        ],
    },
    // output: 'standalone', // Dikomentari karena Google Cloud Buildpacks (source-based deploy) menjalankan `next start` yang memerlukan struktur build standar
    transpilePackages: ['motion'],
    webpack: (config, { dev }) => {
        // HMR is disabled in AI Studio via DISABLE_HMR env var.
        // Do not modify—file watching is disabled to prevent flickering during agent edits.
        if (dev && process.env.DISABLE_HMR === 'true') {
            config.watchOptions = {
                ignored: /.*/,
            };
        }
        return config;
    },
};

export default nextConfig;
