'use client';

import Sidebar from '@/components/sidebar-user';
import BottomNav from '@/components/bottom-nav';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const { currentUser, userProfile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!currentUser) {
                router.push('/login');
            } else if (userProfile && userProfile.role !== 'user') {
                // Admin yang mengakses rute user → arahkan ke admin dashboard
                router.push('/admin/dashboard');
            }
        }
    }, [currentUser, userProfile, loading, router]);

    // Tampilkan loading selama autentikasi atau selama profil belum dimuat
    if (loading || (currentUser && !userProfile)) {
        return (
            <div className="flex bg-stone-50 dark:bg-stone-950 min-h-screen items-center justify-center text-stone-500">
                Memuat data...
            </div>
        );
    }

    if (!currentUser || !userProfile || userProfile.role !== 'user') {
        return null; // Will redirect
    }

    return (
        <div className="flex bg-stone-50 dark:bg-stone-950 min-h-screen transition-colors">
            <Sidebar />
            <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">{children}</main>
            <BottomNav />
        </div>
    );
}
