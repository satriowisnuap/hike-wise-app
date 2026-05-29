'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ThemeToggle from './theme-toggle';
import { BarChart, Mountain, Award, Users, AlertTriangle } from 'lucide-react';

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
        <div className="hidden md:flex flex-col w-64 h-screen fixed top-0 left-0 bg-stone-900 dark:bg-stone-950 text-stone-100 z-10">
            <div className="p-6 border-b border-stone-800">
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                    <span className="text-2xl">🏔️</span>
                    <span className="text-xl font-bold text-emerald-400">Admin Panel</span>
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
                                    ? 'bg-emerald-500/20 text-emerald-400 font-medium'
                                    : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-stone-800">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-stone-400">Kustomisasi</span>
                    <ThemeToggle />
                </div>

                <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                    Keluar
                </button>
            </div>
        </div>
    );
}
