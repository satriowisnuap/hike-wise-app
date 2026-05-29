'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Avatar from './avatar-nav';
import ThemeToggle from './theme-toggle';
import { Home, Map, Briefcase, ShieldCheck, MapPin, Leaf, MessageSquare, Award, User as UserIcon } from 'lucide-react';

const NAV_ITEMS = [
    { label: 'Dashboard', href: '/user/dashboard', icon: Home },
    { label: 'Trail Planner', href: '/user/planner', icon: Map },
    { label: 'Packing List', href: '/user/packing-list', icon: Briefcase },
    { label: 'Safety Checker', href: '/user/safety-checker', icon: ShieldCheck },
    { label: 'My Trips', href: '/user/my-trips', icon: MapPin },
    { label: 'Eco Tracker', href: '/user/eco-tracker', icon: Leaf },
    { label: 'Komunitas', href: '/user/community', icon: MessageSquare },
    { label: 'Achievement', href: '/user/achievements', icon: Award },
    { label: 'Profil', href: '/user/profile', icon: UserIcon },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { userProfile, logout } = useAuth();

    return (
        <div className="hidden md:flex flex-col w-64 h-screen fixed top-0 left-0 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-700 hover-scrolling z-10 transition-colors">
            <div className="p-6">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl">🏔️</span>
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Hike Wise</span>
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
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

                {userProfile && (
                    <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-stone-50 dark:bg-stone-800">
                        <Avatar name={userProfile.name} size="md" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                                {userProfile.name}
                            </p>
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                                Level: {userProfile.ecoScore} Pt
                            </p>
                        </div>
                    </div>
                )}

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
