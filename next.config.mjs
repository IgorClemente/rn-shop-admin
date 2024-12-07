/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'okgtecniketjwxnzgswn.supabase.co'
            }
        ]
    }
};

export default nextConfig;
