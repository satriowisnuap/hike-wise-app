'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot, orderBy, limit, addDoc, Timestamp } from 'firebase/firestore';
import { TrailReport, Mountain } from '@/types';
import Avatar from '@/components/Avatar';
import { toast } from 'sonner';
import Select from '@/components/Select';
import {
    MessageSquare,
    Filter,
    Plus,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Cloud,
    MapPin,
    ChevronDown,
    ChevronUp,
    X,
    Clock,
    Info,
} from 'lucide-react';

export default function CommunityPage() {
    const { currentUser: user } = useAuth();

    const [mountains, setMountains] = useState<Mountain[]>([]);
    const [allReports, setAllReports] = useState<TrailReport[]>([]);
    const [myReports, setMyReports] = useState<TrailReport[]>([]);

    // Filters
    const [mountainFilter, setMountainFilter] = useState('all');
    const [conditionFilter, setConditionFilter] = useState<'all' | 'good' | 'caution' | 'danger'>('all');
    const [visibleCount, setVisibleCount] = useState(10);

    // Modal Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formMountainId, setFormMountainId] = useState('');
    const [formCondition, setFormCondition] = useState<'good' | 'caution' | 'danger'>('good');
    const [formWeather, setFormWeather] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Fetch mountains
        const fetchMountains = async () => {
            try {
                const q = query(collection(db, 'mountains'), where('isOpen', '==', true));
                const snap = await getDocs(q);
                setMountains(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Mountain));
            } catch (err) {}
        };
        fetchMountains();

        // Live reports (approved only)
        const qApproved = query(
            collection(db, 'reports'),
            where('status', '==', 'approved'),
            orderBy('createdAt', 'desc'),
        );
        const unsubApproved = onSnapshot(qApproved, (snapshot) => {
            setAllReports(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as TrailReport));
        });

        return () => unsubApproved();
    }, []);

    useEffect(() => {
        if (!user) return;
        // User's own reports
        const qMy = query(collection(db, 'reports'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
        const unsubMy = onSnapshot(qMy, (snapshot) => {
            setMyReports(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as TrailReport));
        });
        return () => unsubMy();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !formMountainId || !formWeather || formDesc.length < 50) return;

        const m = mountains.find((m) => m.id === formMountainId);
        if (!m) return;

        setSubmitting(true);
        try {
            const report: Omit<TrailReport, 'id'> = {
                userId: user.uid,
                userName: user.displayName || 'Pendaki',
                mountainId: m.id,
                mountainName: m.name,
                condition: formCondition,
                weather: formWeather,
                description: formDesc,
                status: 'pending',
                rejectionNote: '',
                createdAt: Timestamp.now(),
            };

            await addDoc(collection(db, 'reports'), report);
            toast.success('Laporan dikirim! Menunggu review admin.');

            setIsModalOpen(false);
            setFormMountainId('');
            setFormWeather('');
            setFormDesc('');
            setFormCondition('good');
        } catch (err) {
            toast.error('Gagal mengirim laporan');
        } finally {
            setSubmitting(false);
        }
    };

    const getRelativeTime = (ts: Timestamp) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const date = ts.toDate();
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(today.getTime() - d.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hari ini';
        if (diffDays === 1) return 'Kemarin';
        return `${diffDays} hari lalu`;
    };

    const ConditionBadge = ({ cond }: { cond: 'good' | 'caution' | 'danger' }) => {
        if (cond === 'good')
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                    <CheckCircle className="w-3 h-3" /> Aman
                </span>
            );
        if (cond === 'caution')
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                    <AlertTriangle className="w-3 h-3" /> Waspada
                </span>
            );
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                <XCircle className="w-3 h-3" /> Berbahaya
            </span>
        );
    };

    const StatusBadge = ({ status }: { status: string }) => {
        if (status === 'pending')
            return (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
                    Menunggu Review
                </span>
            );
        if (status === 'approved')
            return (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                    Disetujui
                </span>
            );
        if (status === 'rejected')
            return (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                    Ditolak
                </span>
            );
        return null;
    };

    const filteredReports = allReports.filter((r) => {
        const passM = mountainFilter === 'all' || r.mountainId === mountainFilter;
        const passC = conditionFilter === 'all' || r.condition === conditionFilter;
        return passM && passC;
    });

    const visibleReports = filteredReports.slice(0, visibleCount);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 md:pb-8">
            {/* Header & Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-500" /> Laporan Jalur
                        Komunitas
                    </h1>
                    <p className="text-stone-500 dark:text-stone-400 mt-1 text-sm">Info terkini dari sesama pendaki.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Buat Laporan
                </button>
            </div>

            <div className="flex flex-wrap gap-3 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm">
                <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 shrink-0">
                    <Filter className="w-4 h-4" /> <span className="text-sm font-semibold">Filter:</span>
                </div>
                <Select
                    value={mountainFilter}
                    onChange={(val) => setMountainFilter(val as string)}
                    options={[
                        { label: 'Semua Gunung', value: 'all' },
                        ...mountains.map((m) => ({ label: m.name, value: m.id })),
                    ]}
                    placeholder=""
                />

                <Select
                    value={conditionFilter}
                    onChange={(val) => setConditionFilter(val as any)}
                    options={[
                        { label: 'Semua Kondisi', value: 'all' },
                        { label: 'Aman', value: 'good' },
                        { label: 'Waspada', value: 'caution' },
                        { label: 'Berbahaya', value: 'danger' },
                    ]}
                    placeholder=""
                />
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                {visibleReports.map((report) => (
                    <ReportCard
                        key={report.id}
                        report={report}
                        getRelativeTime={getRelativeTime}
                        ConditionBadge={ConditionBadge}
                    />
                ))}
                {visibleReports.length === 0 && (
                    <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700">
                        <MessageSquare className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
                        <p className="text-stone-500 dark:text-stone-400">Belum ada laporan yang sesuai filter.</p>
                    </div>
                )}

                {visibleReports.length < filteredReports.length && (
                    <div className="pt-4 flex justify-center">
                        <button
                            onClick={() => setVisibleCount((prev) => prev + 10)}
                            className="px-6 py-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                        >
                            Muat Lebih Banyak
                        </button>
                    </div>
                )}
            </div>

            {/* My Reports */}
            {myReports.length > 0 && (
                <div className="pt-8 border-t border-stone-200 dark:border-stone-700 space-y-4">
                    <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Laporan Saya</h2>
                    <div className="space-y-3">
                        {myReports.map((report) => (
                            <div
                                key={report.id}
                                className="p-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 flex flex-col md:flex-row justify-between gap-4"
                            >
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-stone-900 dark:text-stone-100">
                                            {report.mountainName}
                                        </span>
                                        <StatusBadge status={report.status} />
                                    </div>
                                    <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-1">
                                        {report.description}
                                    </p>
                                    {report.status === 'rejected' && report.rejectionNote && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-2 bg-red-50 dark:bg-red-900/10 p-2 rounded">
                                            Alasan penolakan: {report.rejectionNote}
                                        </p>
                                    )}
                                </div>
                                <div className="shrink-0 text-left md:text-right">
                                    <ConditionBadge cond={report.condition} />
                                    <p className="text-xs text-stone-400 mt-1">{getRelativeTime(report.createdAt)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-stone-200 dark:border-stone-700 flex justify-between items-center bg-stone-50 dark:bg-stone-900/50">
                            <h2 className="font-bold text-stone-900 dark:text-stone-100">Buat Laporan Baru</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <Select
                                    label="Gunung"
                                    value={formMountainId}
                                    onChange={(val) => setFormMountainId(val as string)}
                                    options={mountains.map((m) => ({ label: m.name, value: m.id }))}
                                    placeholder="Pilih Gunung"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">
                                    Kondisi Saat Ini
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormCondition('good')}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-1 ${formCondition === 'good' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500' : 'border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400'}`}
                                    >
                                        <CheckCircle className="w-6 h-6" />{' '}
                                        <span className="text-xs font-bold">Aman</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormCondition('caution')}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-1 ${formCondition === 'caution' ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-500 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500' : 'border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400'}`}
                                    >
                                        <AlertTriangle className="w-6 h-6" />{' '}
                                        <span className="text-xs font-bold">Waspada</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormCondition('danger')}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-1 ${formCondition === 'danger' ? 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400 ring-1 ring-red-500' : 'border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400'}`}
                                    >
                                        <XCircle className="w-6 h-6" />{' '}
                                        <span className="text-xs font-bold">Berbahaya</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">
                                    Cuaca (Maks 100 Karakter)
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={100}
                                    value={formWeather}
                                    onChange={(e) => setFormWeather(e.target.value)}
                                    placeholder="Contoh: Cerah berawan, angin tenang"
                                    className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">
                                    Deskripsi (Min 50 Karakter)
                                </label>
                                <textarea
                                    required
                                    minLength={50}
                                    maxLength={500}
                                    rows={4}
                                    value={formDesc}
                                    onChange={(e) => setFormDesc(e.target.value)}
                                    placeholder="Ceritakan kondisi jalur, ketersediaan air, dan info penting lainnya..."
                                    className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                />
                                <div className="flex justify-between text-xs font-medium text-stone-500 dark:text-stone-400">
                                    <span className={formDesc.length > 0 && formDesc.length < 50 ? 'text-red-500' : ''}>
                                        {formDesc.length < 50
                                            ? `Kurang ${50 - formDesc.length} karakter`
                                            : 'Panjang deskripsi OK'}
                                    </span>
                                    <span>{formDesc.length}/500</span>
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl flex gap-3 items-start border border-blue-100 dark:border-blue-900/30">
                                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                                    Laporan ditinjau admin sebelum ditampilkan ke publik untuk memastikan validitas
                                    informasi.
                                </p>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting || formDesc.length < 50}
                                    className="w-full py-4 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-bold hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                                >
                                    {submitting ? 'Mengirim...' : 'Kirim Laporan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function ReportCard({
    report,
    getRelativeTime,
    ConditionBadge,
}: {
    report: TrailReport;
    getRelativeTime: any;
    ConditionBadge: any;
}) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">{report.mountainName}</h3>
                        <ConditionBadge cond={report.condition} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
                        <Cloud className="w-4 h-4 text-stone-400" />
                        <span>{report.weather}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-stone-50 dark:bg-stone-800/50 p-2 rounded-xl border border-stone-100 dark:border-stone-800 shrink-0 self-start sm:self-auto">
                    <Avatar name={report.userName} size="sm" />
                    <div>
                        <p className="text-xs font-bold text-stone-900 dark:text-stone-100">{report.userName}</p>
                        <p className="text-[10px] text-stone-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {getRelativeTime(report.createdAt)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="relative">
                <p
                    className={`text-sm text-stone-700 dark:text-stone-300 leading-relaxed ${!expanded ? 'line-clamp-2' : ''}`}
                >
                    {report.description}
                </p>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1 hover:underline"
                >
                    {expanded ? (
                        <>
                            Tutup <ChevronUp className="w-3 h-3" />
                        </>
                    ) : (
                        <>
                            Baca Selengkapnya <ChevronDown className="w-3 h-3" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
