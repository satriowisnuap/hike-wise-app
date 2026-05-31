'use client';

import AdminSidebar from '@/components/sidebar-admin';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { currentUser, userProfile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!currentUser) {
                router.push('/login');
            } else if (userProfile && userProfile.role !== 'admin') {
                // Profil sudah dimuat tapi bukan admin
                router.push('/user/dashboard');
            }
        }
    }, [currentUser, userProfile, loading, router]);

    // Tampilkan loading selama autentikasi atau selama profil belum dimuat
    if (loading || (currentUser && !userProfile)) {
        return (
            <div className="flex bg-stone-950 min-h-screen items-center justify-center text-stone-500">
                Memuat data...
            </div>
        );
    }

    if (!currentUser || !userProfile || userProfile.role !== 'admin') {
        return null; // Will redirect
    }

    return (
        <div className="flex bg-stone-50 dark:bg-stone-950 min-h-screen transition-colors">
            <AdminSidebar />
            <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
    );
}
