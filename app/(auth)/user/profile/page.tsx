'use client';

import { useAuth } from '@/lib/auth-context';
import Avatar from '@/components/avatar-nav';
import ThemeToggle from '@/components/theme-toggle';
import { Award, Leaf, Map, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
    const { userProfile } = useAuth();

    if (!userProfile) return null;

    const dateStr = userProfile.createdAt
        ? new Date(userProfile.createdAt.toMillis()).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : 'Tidak diketahui';

    const nextLevelScore = 100;
    const progressPercent = Math.min(100, Math.round((userProfile.ecoScore / nextLevelScore) * 100));

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between md:hidden mb-4">
                <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Profil Saya</h1>
                <ThemeToggle />
            </div>

            {/* Header Info */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-8 rounded-3xl flex flex-col items-center text-center">
                <Avatar name={userProfile.name} size="xl" className="mb-4 shadow-sm" />
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">{userProfile.name}</h2>
                <p className="text-stone-500 dark:text-stone-400 mt-1">{userProfile.email}</p>
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-2">Member sejak {dateStr}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <Map className="w-6 h-6 text-indigo-500 mb-2" />
                    <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{userProfile.totalTrips}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Total Trip</p>
                </div>
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <CheckCircle className="w-6 h-6 text-emerald-500 mb-2" />
                    <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">0</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Selesai</p>
                </div>
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <Map className="w-6 h-6 text-amber-500 mb-2 opacity-50" />
                    <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">0</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Direncanakan</p>
                </div>
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-4 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <Leaf className="w-16 h-16 text-emerald-100 dark:text-emerald-900/30 absolute -right-4 -bottom-4" />
                    <Leaf className="w-6 h-6 text-emerald-500 mb-2" />
                    <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 relative z-10">
                        {userProfile.ecoScore}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 relative z-10">Eco Score</p>
                </div>
            </div>

            {/* Eco Level Progress */}
            <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 p-6 rounded-2xl">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Level Eco-Warrior</h3>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400/70">
                            {nextLevelScore - userProfile.ecoScore} Pt menuju level selanjutnya
                        </p>
                    </div>
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{progressPercent}%</span>
                </div>
                <div className="w-full h-3 bg-emerald-200 dark:bg-emerald-900/50 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
            </div>

            {/* Achievements / History - Empty States */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-orange-500" /> Badge Kehormatan
                    </h3>
                    <div className="py-8 text-center text-stone-500 dark:text-stone-400">
                        <p className="text-sm">Belum ada badge yang diraih.</p>
                        <p className="text-xs mt-1">Selesaikan trip atau laporkan sampah untuk meraih badge!</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-4">Riwayat Perjalanan</h3>
                    <div className="py-8 text-center text-stone-500 dark:text-stone-400">
                        <p className="text-sm">Belum ada riwayat pendakian.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
