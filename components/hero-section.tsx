'use client';

import Link from 'next/link';
import { ArrowRight, ChevronDown, Users, Mountain, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function HeroSection() {
    const [stats, setStats] = useState({ hikers: 0, mountains: 0, trash: 0 });

    useEffect(() => {
        let isMounted = true;
        let interval: NodeJS.Timeout;

        const fetchStatsAndAnimate = async () => {
            try {
                const uSnap = await getDocs(collection(db, 'users'));
                const mSnap = await getDocs(collection(db, 'mountains'));
                const tSnap = await getDocs(collection(db, 'trips'));

                if (!isMounted) return;

                const totalHikers = uSnap.size;
                const totalMountains = mSnap.size;
                let totalTrash = 0;
                tSnap.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.ecoLog && typeof data.ecoLog.wasteKg === 'number') {
                        totalTrash += data.ecoLog.wasteKg;
                    }
                });

                const hikersCount = totalHikers;
                const mountainsCount = totalMountains;
                const trashCount = totalTrash;

                let frame = 0;
                interval = setInterval(() => {
                    if (!isMounted) {
                        clearInterval(interval);
                        return;
                    }
                    frame++;
                    setStats({
                        hikers: Math.min(Math.floor((hikersCount / 20) * frame), hikersCount),
                        mountains: Math.min(Math.floor((mountainsCount / 20) * frame), mountainsCount),
                        trash: Math.min(Math.floor((trashCount / 20) * frame), trashCount),
                    });
                    if (frame >= 20) clearInterval(interval);
                }, 50);
            } catch (err) {
                console.error("Failed to fetch hero stats:", err);
                if (!isMounted) return;

                // Fallback mock stats in case of query failure
                const finalStats = { hikers: 1240, mountains: 87, trash: 2400 };
                let frame = 0;
                interval = setInterval(() => {
                    if (!isMounted) {
                        clearInterval(interval);
                        return;
                    }
                    frame++;
                    setStats({
                        hikers: Math.min(Math.floor((finalStats.hikers / 20) * frame), finalStats.hikers),
                        mountains: Math.min(Math.floor((finalStats.mountains / 20) * frame), finalStats.mountains),
                        trash: Math.min(Math.floor((finalStats.trash / 20) * frame), finalStats.trash),
                    });
                    if (frame >= 20) clearInterval(interval);
                }, 50);
            }
        };

        fetchStatsAndAnimate();

        return () => {
            isMounted = false;
            if (interval) clearInterval(interval);
        };
    }, []);

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-stone-900 to-stone-950 py-24 sm:py-32">
            <div className="absolute inset-0 bg-[url('https://picsum.photos/id/1018/1920/1080')] bg-cover bg-center opacity-20 mix-blend-overlay" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
                    Jelajahi Alam,
                    <br className="hidden sm:block" />
                    <span className="text-emerald-400"> Jaga Bumi Bersama</span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg sm:text-xl text-stone-300 mb-10 text-balance">
                    Hike Wise adalah pendamping pendakian cerdasmu. Rencanakan perjalanan dengan aman, siapkan barang
                    bawaan, dan lacak dampak positifmu untuk lingkungan.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                        href="/register"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-xl text-stone-900 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-lg"
                    >
                        Mulai Rencanakan <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a
                        href="#fitur"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-xl text-white bg-stone-800/50 hover:bg-stone-800/80 backdrop-blur-sm border border-stone-700 transition-colors"
                    >
                        Lihat Fitur <ChevronDown className="w-4 h-4" />
                    </a>
                </div>

                {/* Stats */}
                <div className="mt-16 grid grid-cols-3 gap-4 border-t border-stone-800/50 pt-8 max-w-3xl mx-auto">
                    <div className="flex flex-col items-center gap-1">
                        <Users className="w-5 h-5 text-stone-400 mb-1" />
                        <p className="text-3xl font-bold text-white">{stats.hikers}+</p>
                        <p className="text-sm font-medium text-stone-400 uppercase tracking-wide">Pendaki</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Mountain className="w-5 h-5 text-stone-400 mb-1" />
                        <p className="text-3xl font-bold text-white">{stats.mountains}</p>
                        <p className="text-sm font-medium text-stone-400 uppercase tracking-wide">Gunung</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Trash2 className="w-5 h-5 text-emerald-500 mb-1" />
                        <p className="text-3xl font-bold text-emerald-400">
                            {stats.trash.toLocaleString('id-ID')} <span className="text-xl">kg</span>
                        </p>
                        <p className="text-sm font-medium text-emerald-600 uppercase tracking-wide">Sampah Turun</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
