'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { User, Trip, Mountain, TrailReport } from '@/types';
import Avatar from '@/components/Avatar';
import Link from 'next/link';
import {
    Users,
    Mountain as MountainIcon,
    Compass,
    MessageSquare,
    ArrowRight,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({ users: 0, mountains: 0, trips: 0, pendingReports: 0 });
    const [recentUsers, setRecentUsers] = useState<User[]>([]);
    const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
    const [pendingReports, setPendingReports] = useState<TrailReport[]>([]);

    useEffect(() => {
        // Basic stats fetch (one time)
        const fetchStats = async () => {
            try {
                const uSnap = await getDocs(collection(db, 'users'));
                const mSnap = await getDocs(collection(db, 'mountains'));
                const tSnap = await getDocs(query(collection(db, 'trips'), where('status', '==', 'completed')));

                setStats((prev) => ({
                    ...prev,
                    users: uSnap.size,
                    mountains: mSnap.size,
                    trips: tSnap.size,
                }));
            } catch (err) {
                console.error('Failed to fetch stats', err);
            }
        };
        fetchStats();

        // Recent Users
        const unsubUsers = onSnapshot(
            query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(5)),
            (snap) => {
                setRecentUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as User));
            },
        );

        // Recent Trips
        const unsubTrips = onSnapshot(
            query(collection(db, 'trips'), orderBy('createdAt', 'desc'), limit(5)),
            (snap) => {
                setRecentTrips(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Trip));
            },
        );

        // Pending Reports (Real-time for count and list)
        const unsubReports = onSnapshot(
            query(collection(db, 'reports'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'), limit(5)),
            (snap) => {
                const reports = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TrailReport);

                setPendingReports(reports);
            },
            (error) => {
                console.warn('Reports index still building:', error);
            },
        );

        const fetchPendingCount = async () => {
            const pSnap = await getDocs(query(collection(db, 'reports'), where('status', '==', 'pending')));
            setStats((prev) => ({ ...prev, pendingReports: pSnap.size }));
        };
        fetchPendingCount();

        return () => {
            unsubUsers();
            unsubTrips();
            unsubReports();
        };
    }, []);

    const handleApproveReport = async (reportId: string) => {
        try {
            await updateDoc(doc(db, 'reports', reportId), { status: 'approved' });
            toast.success('Laporan disetujui');
        } catch (err) {
            toast.error('Gagal menyetujui laporan');
        }
    };

    const handleRejectReport = async (reportId: string) => {
        try {
            await updateDoc(doc(db, 'reports', reportId), {
                status: 'rejected',
                rejectionNote: 'Ditolak via Dashboard',
            });
            toast.success('Laporan ditolak');
        } catch (err) {
            toast.error('Gagal menolak laporan');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-8">
            <div>
                <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Dashboard Admin</h1>
                <p className="text-stone-500 dark:text-stone-400">Ringkasan aktivitas platform TrailMind.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: 'Total User',
                        value: stats.users,
                        icon: <Users className="w-6 h-6 text-blue-500" />,
                        color: 'border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/10',
                    },
                    {
                        label: 'Total Gunung',
                        value: stats.mountains,
                        icon: <MountainIcon className="w-6 h-6 text-emerald-500" />,
                        color: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/10',
                    },
                    {
                        label: 'Trip Selesai',
                        value: stats.trips,
                        icon: <Compass className="w-6 h-6 text-purple-500" />,
                        color: 'border-purple-200 bg-purple-50 dark:border-purple-900/50 dark:bg-purple-900/10',
                    },
                    {
                        label: 'Laporan Menunggu',
                        value: stats.pendingReports,
                        icon: <MessageSquare className="w-6 h-6 text-amber-500" />,
                        color: 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/10',
                        alert: stats.pendingReports > 0,
                    },
                ].map((stat, i) => (
                    <div key={i} className={`p-6 rounded-2xl border ${stat.color} relative overflow-hidden`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white dark:bg-stone-800 rounded-xl shadow-sm">{stat.icon}</div>
                            {stat.alert && (
                                <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                            )}
                        </div>
                        <h3 className="text-sm font-semibold text-stone-600 dark:text-stone-400 mb-1">{stat.label}</h3>
                        <p className="text-3xl font-bold text-stone-900 dark:text-stone-100">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Quick Nav */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { name: 'Kelola User', path: '/admin/users', icon: <Users /> },
                    { name: 'Kelola Gunung', path: '/admin/mountains', icon: <MountainIcon /> },
                    { name: 'Moderasi Laporan', path: '/admin/reports', icon: <MessageSquare /> },
                    { name: 'Pencapaian', path: '/admin/achievements', icon: <Award className="w-5 h-5" /> },
                ].map((nav) => (
                    <Link
                        key={nav.path}
                        href={nav.path}
                        className="p-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 flex items-center justify-between group hover:border-emerald-500 transition-colors"
                    >
                        <div className="flex items-center gap-3 font-semibold text-stone-700 dark:text-stone-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                            <div className="text-stone-400 group-hover:text-emerald-500">{nav.icon}</div>
                            <span className="text-sm md:text-base">{nav.name}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-emerald-500" />
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                {/* Recent Activity: Pending Reports */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                            Laporan Menunggu (Action Required)
                        </h2>
                        <Link
                            href="/admin/reports"
                            className="text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                        >
                            Lihat Semua
                        </Link>
                    </div>
                    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                        {pendingReports.length > 0 ? (
                            <div className="divide-y divide-stone-100 dark:divide-stone-800">
                                {pendingReports.map((rep) => (
                                    <div
                                        key={rep.id}
                                        className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                                                    {rep.mountainName}
                                                </span>
                                                <span className="text-xs px-2 py-0.5 bg-stone-100 dark:bg-stone-800 rounded">
                                                    {rep.condition}
                                                </span>
                                            </div>
                                            <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-1">
                                                {rep.description}
                                            </p>
                                            <p className="text-xs text-stone-400 mt-1">Oleh: {rep.userName}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => handleApproveReport(rep.id)}
                                                className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                                                title="Setujui"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleRejectReport(rep.id)}
                                                className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
                                                title="Tolak"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-stone-500 dark:text-stone-400">
                                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
                                <p className="text-sm">Semua laporan telah ditinjau.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity: Users & Trips */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">User Baru</h2>
                        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden divide-y divide-stone-100 dark:divide-stone-800">
                            {recentUsers.map((u) => (
                                <div key={u.uid} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar name={u.name} size="sm" />
                                        <div>
                                            <p className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                                                {u.name}
                                            </p>
                                            <p className="text-xs text-stone-500 dark:text-stone-400">{u.email}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-stone-400">
                                        {u.createdAt?.toDate().toLocaleDateString('id-ID')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Trip Terkini</h2>
                        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden divide-y divide-stone-100 dark:divide-stone-800">
                            {recentTrips.map((t) => (
                                <div key={t.id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                                            {t.mountainName}
                                        </p>
                                        <p className="text-xs text-stone-500 dark:text-stone-400">
                                            {t.status === 'planned'
                                                ? 'Direncanakan'
                                                : t.status === 'ongoing'
                                                  ? 'Berlangsung'
                                                  : 'Selesai'}{' '}
                                            • {t.members} Org
                                        </p>
                                    </div>
                                    <span className="text-xs text-stone-400">
                                        {t.createdAt?.toDate().toLocaleDateString('id-ID')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Dummy import to satisfy compiler since Award isn't exported from lucide by default? Wait, Award is.
import { Award } from 'lucide-react';
