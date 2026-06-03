import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
    metadataBase: new URL('https://hike-wise-app.vercel.app/'),

    title: 'Hike Wise',

    description: 'AI-powered hiking and eco-adventure companion.',

    openGraph: {
        title: 'Hike Wise',
        description: 'AI-powered hiking and eco-adventure companion.',
        url: 'https://hike-wise-app.vercel.app/',
        siteName: 'Hike Wise',
        images: [
            {
                url: '/images/preview.png',
                width: 1200,
                height: 630,
                alt: 'Hike Wise',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },

    twitter: {
        card: 'summary_large_image',
        title: 'Hike Wise',
        description: 'AI-powered hiking and eco-adventure companion.',
        images: ['/preview.png'],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id" suppressHydrationWarning>
            {' '}
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `               (function() {
                const theme = localStorage.getItem('trailmind-theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
                    }}
                />{' '}
            </head>
            <body className="antialiased bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 min-h-screen">
                <AuthProvider>
                    {children}
                    <Toaster richColors position="top-center" />
                </AuthProvider>
            </body>
        </html>
    );
}
