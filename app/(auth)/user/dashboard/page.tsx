'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Avatar from '@/components/Avatar';
import Link from 'next/link';
import { Map, Briefcase, ShieldCheck, MapPin, Leaf, MessageSquare } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { TrailReport } from '@/types';

export default function Dashboard() {
    const { userProfile } = useAuth();
    const [reports, setReports] = useState<TrailReport[]>([]);

    useEffect(() => {
        const q = query(
            collection(db, 'reports'),
            where('status', '==', 'approved'),
            orderBy('createdAt', 'desc'),
            limit(3)
        );
        const unsub = onSnapshot(q, (snapshot) => {
            setReports(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TrailReport)));
        });
        return () => unsub();
    }, []);

    if (!userProfile) return null;

    const firstName = userProfile.name.split(' ')[0];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-6 rounded-2xl">
                <Avatar name={userProfile.name} size="xl" />
                <div>
                    <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                        Selamat datang, {firstName}!
                    </h1>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-sm font-medium">
                        <Leaf className="w-4 h-4" />
                        <span>Eco Level: {userProfile.ecoScore} Pt</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Trip', value: userProfile.totalTrips },
                    { label: 'Selesai', value: userProfile.totalTrips }, // Mocking for now
                    { label: 'Badge', value: 0 },
                    { label: 'Eco Score', value: userProfile.ecoScore },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-4 rounded-2xl text-center"
                    >
                        <p className="text-stone-500 dark:text-stone-400 text-sm">{stat.label}</p>
                        <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-4">Aksi Cepat</h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        {
                            icon: Map,
                            path: '/user/planner',
                            label: 'Rencanakan Trip',
                            color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
                        },
                        {
                            icon: Briefcase,
                            path: '/user/packing-list',
                            label: 'Cek Packing',
                            color: 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300',
                        },
                        {
                            icon: ShieldCheck,
                            path: '/user/safety-checker',
                            label: 'Cek Keselamatan',
                            color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300',
                        },
                        {
                            icon: MapPin,
                            path: '/user/my-trips',
                            label: 'Trip Saya',
                            color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300',
                        },
                        {
                            icon: Leaf,
                            path: '/user/eco-tracker',
                            label: 'Lapor Sampah',
                            color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300',
                        },
                        {
                            icon: MessageSquare,
                            path: '/user/community',
                            label: 'Laporan Komunitas',
                            color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
                        },
                    ].map((action, i) => (
                        <Link
                            key={i}
                            href={action.path}
                            className="flex items-center gap-3 p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl transition-all group"
                        >
                            <div className={`p-2 rounded-lg ${action.color}`}>
                                <action.icon className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {action.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Upcoming Trip Card - Mock */}
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-6 rounded-2xl">
                    <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-4">Trip Terdekat</h2>
                    <div className="flex flex-col items-center justify-center py-8 text-center text-stone-500 dark:text-stone-400">
                        <Map className="w-12 h-12 mb-3 opacity-20" />
                        <p>Belum ada trip direncanakan.</p>
                        <Link
                            href="/user/planner"
                            className="mt-4 text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                        >
                            Buat Rencana Baru
                        </Link>
                    </div>
                </div>

                {/* Live Community Feed */}
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-6 rounded-2xl relative overflow-hidden pb-16">
                    <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-4">Live Komunitas</h2>
                    <div className="space-y-4">
                        {reports.map((report, idx) => (
                            <div 
                                key={report.id} 
                                className={`flex gap-3 ${idx === reports.length - 1 && reports.length >= 3 ? 'relative before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:to-white dark:before:to-stone-900' : ''}`}
                            >
                                <Avatar name={report.userName} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                                        {report.userName}{' '}
                                        <span className="text-stone-500 dark:text-stone-400 font-normal">
                                            di {report.mountainName}
                                        </span>
                                    </p>
                                    <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5 break-words line-clamp-2">
                                        &quot;{report.description}&quot;
                                    </p>
                                </div>
                            </div>
                        ))}
                        {reports.length === 0 && (
                            <div className="text-center py-6 text-stone-500 dark:text-stone-400 text-sm">
                                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p>Belum ada laporan komunitas.</p>
                            </div>
                        )}
                    </div>
                    <Link
                        href="/user/community"
                        className="absolute bottom-0 left-0 right-0 text-center text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm py-3 border-t border-stone-100 dark:border-stone-800"
                    >
                        Lihat semua laporan
                    </Link>
                </div>
            </div>
        </div>
    );
}
