'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ThemeToggle from './ThemeToggle';
import { BarChart, Mountain, Award, Users, AlertTriangle, Trees } from 'lucide-react';

const NAV_ITEMS = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: BarChart },
    { label: 'Kelola Gunung', href: '/admin/mountains', icon: Mountain },
    { label: 'Achievement', href: '/admin/achievements', icon: Award },
    { label: 'Pengguna', href: '/admin/users', icon: Users },
    { label: 'Moderasi Laporan', href: '/admin/reports', icon: AlertTriangle },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <div className="hidden md:flex flex-col w-64 h-screen fixed top-0 left-0 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-700 z-10 transition-colors">
            <div className="p-6">
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                    <Trees className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Hike Wise</span>
                </Link>
            </div>

            <nav className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                isActive
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-medium'
                                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-stone-200 dark:border-stone-700">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-stone-500 dark:text-stone-400">Kustomisasi</span>
                    <ThemeToggle />
                </div>

                <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                >
                    Keluar
                </button>
            </div>
        </div>
    );
}
