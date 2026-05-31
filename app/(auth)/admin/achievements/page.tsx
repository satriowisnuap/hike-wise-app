'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, doc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { Achievement } from '@/types';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, X, Loader2, Award, Search, Filter } from 'lucide-react';
import Select from '@/components/Select';

// ─── Default seed data ────────────────────────────────────────────────────────
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first-step',
        name: 'Langkah Pertama',
        icon: '🥾',
        category: 'explorer',
        description: 'Selesaikan trip pertamamu',
        triggerCondition: 'first-step',
        isActive: true,
    },
    {
        id: 'mountain-hopper',
        name: 'Mountain Hopper',
        icon: '🏔️',
        category: 'explorer',
        description: 'Kunjungi 3 gunung berbeda',
        triggerCondition: 'mountain-hopper',
        isActive: true,
    },
    {
        id: 'peak-collector',
        name: 'Kolektor Puncak',
        icon: '🗻',
        category: 'explorer',
        description: 'Taklukkan 5 gunung berbeda',
        triggerCondition: 'peak-collector',
        isActive: true,
    },
    {
        id: 'eco-starter',
        name: 'Eco Starter',
        icon: '🌱',
        category: 'eco',
        description: 'Buat eco log pertamamu',
        triggerCondition: 'eco-starter',
        isActive: true,
    },
    {
        id: 'waste-warrior',
        name: 'Waste Warrior',
        icon: '♻️',
        category: 'eco',
        description: 'Kumpulkan 5kg sampah total',
        triggerCondition: 'waste-warrior',
        isActive: true,
    },
    {
        id: 'forest-guardian',
        name: 'Penjaga Hutan',
        icon: '🌳',
        category: 'eco',
        description: 'Raih eco score 100+',
        triggerCondition: 'forest-guardian',
        isActive: true,
    },
    {
        id: 'team-player',
        name: 'Tim Solid',
        icon: '👥',
        category: 'explorer',
        description: 'Trip dengan 4+ anggota',
        triggerCondition: 'team-player',
        isActive: true,
    },
    {
        id: 'prepared-hiker',
        name: 'Pendaki Siap',
        icon: '🎒',
        category: 'safety',
        description: 'Buat 3 packing list',
        triggerCondition: 'prepared-hiker',
        isActive: true,
    },
    {
        id: 'safety-first',
        name: 'Safety First',
        icon: '🛡️',
        category: 'safety',
        description: 'Lakukan 5 safety check',
        triggerCondition: 'safety-first',
        isActive: true,
    },
    {
        id: 'trail-reporter',
        name: 'Reporter Jalur',
        icon: '📢',
        category: 'community',
        description: 'Submit 3 laporan jalur',
        triggerCondition: 'trail-reporter',
        isActive: true,
    },
    {
        id: 'trusted-reporter',
        name: 'Reporter Terpercaya',
        icon: '⭐',
        category: 'community',
        description: 'Raih 5 laporan disetujui',
        triggerCondition: 'trusted-reporter',
        isActive: true,
    },
    {
        id: 'veteran-hiker',
        name: 'Veteran Pendaki',
        icon: '🎯',
        category: 'explorer',
        description: 'Selesaikan 10 trip',
        triggerCondition: 'veteran-hiker',
        isActive: true,
    },
];

const EMPTY_FORM: Partial<Achievement> = {
    name: '',
    icon: '🏆',
    category: 'explorer',
    description: '',
    triggerCondition: '',
    isActive: true,
};

const CATEGORIES: { value: Achievement['category']; label: string; color: string }[] = [
    {
        value: 'explorer',
        label: 'Explorer',
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    { value: 'eco', label: 'Eco', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    { value: 'safety', label: 'Safety', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    {
        value: 'community',
        label: 'Komunitas',
        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    },
];

function CategoryBadge({ category }: { category: string }) {
    const cat = CATEGORIES.find((c) => c.value === category);
    if (!cat) return <span className="text-xs text-stone-400">{category}</span>;
    return <span className={`text-xs px-2 py-1 rounded font-semibold ${cat.color}`}>{cat.label}</span>;
}

export default function AdminAchievementsPage() {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [userCounts, setUserCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);

    // Search & filter
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Panel state
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState('');
    const [formData, setFormData] = useState<Partial<Achievement>>({ ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);

    // Delete confirm
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    // ─── Real-time listeners ───────────────────────────────────────────────────
    useEffect(() => {
        // Listen achievements
        const unsub = onSnapshot(
            query(collection(db, 'achievements')),
            async (snap) => {
                if (snap.empty && !seeding) {
                    // Seed default achievements
                    setSeeding(true);
                    try {
                        for (const a of DEFAULT_ACHIEVEMENTS) {
                            await setDoc(doc(db, 'achievements', a.id), a);
                        }
                    } catch {
                        toast.error('Gagal menanam data awal pencapaian');
                    } finally {
                        setSeeding(false);
                    }
                    return;
                }
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Achievement);
                list.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
                setAchievements(list);
                setLoading(false);
            },
            (err) => {
                console.error(err);
                toast.error('Gagal memuat data pencapaian');
                setLoading(false);
            },
        );

        // Listen userAchievements for counts
        const unsubUA = onSnapshot(query(collection(db, 'userAchievements')), (snap) => {
            const counts: Record<string, number> = {};
            snap.docs.forEach((d) => {
                const achId = d.data().achievementId as string;
                counts[achId] = (counts[achId] || 0) + 1;
            });
            setUserCounts(counts);
        });

        return () => {
            unsub();
            unsubUA();
        };
    }, [seeding]);

    // ─── Form helpers ──────────────────────────────────────────────────────────
    const resetForm = useCallback(() => {
        setFormData({ ...EMPTY_FORM });
        setIsEditing(false);
        setCurrentId('');
    }, []);

    const handleOpenAdd = () => {
        resetForm();
        setIsPanelOpen(true);
    };

    const handleOpenEdit = (ach: Achievement) => {
        setFormData({ ...ach });
        setCurrentId(ach.id);
        setIsEditing(true);
        setIsPanelOpen(true);
    };

    // ─── Save (Create / Update) ────────────────────────────────────────────────
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name?.trim()) {
            toast.error('Nama achievement wajib diisi');
            return;
        }
        if (!formData.icon?.trim()) {
            toast.error('Icon emoji wajib diisi');
            return;
        }
        if (!formData.description?.trim()) {
            toast.error('Deskripsi wajib diisi');
            return;
        }
        if (!formData.triggerCondition?.trim()) {
            toast.error('Trigger condition wajib diisi');
            return;
        }

        setSaving(true);
        try {
            const id = isEditing
                ? currentId
                : formData
                      .name!.trim()
                      .toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^a-z0-9-]/g, '') + `-${Date.now()}`;

            const data: Achievement = {
                id,
                name: formData.name!.trim(),
                icon: formData.icon!.trim(),
                category: formData.category as Achievement['category'],
                description: formData.description!.trim(),
                triggerCondition: formData.triggerCondition!.trim(),
                isActive: formData.isActive ?? true,
                // keep existing Timestamp fields when editing
                ...(isEditing ? {} : {}),
            } as Achievement;

            await setDoc(doc(db, 'achievements', id), data, { merge: true });
            toast.success(isEditing ? 'Achievement berhasil diperbarui!' : 'Achievement berhasil ditambahkan!');
            setIsPanelOpen(false);
            resetForm();
        } catch (err: unknown) {
            console.error(err);
            toast.error('Gagal menyimpan: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    // ─── Toggle active inline ──────────────────────────────────────────────────
    const handleToggleActive = async (id: string, current: boolean) => {
        try {
            await updateDoc(doc(db, 'achievements', id), { isActive: !current });
            toast.success(`Achievement ${!current ? 'diaktifkan' : 'dinonaktifkan'}`);
        } catch {
            toast.error('Gagal mengubah status');
        }
    };

    // ─── Delete ────────────────────────────────────────────────────────────────
    const handleDelete = async (id: string) => {
        setDeleting(true);
        try {
            await deleteDoc(doc(db, 'achievements', id));
            toast.success('Achievement berhasil dihapus');
        } catch {
            toast.error('Gagal menghapus achievement');
        } finally {
            setDeleting(false);
            setDeleteConfirmId(null);
        }
    };

    // ─── Filtered list ─────────────────────────────────────────────────────────
    const filtered = achievements.filter((a) => {
        const qMatch =
            a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.description.toLowerCase().includes(searchQuery.toLowerCase());
        const catMatch = filterCategory === 'all' || a.category === filterCategory;
        const statusMatch =
            filterStatus === 'all' ||
            (filterStatus === 'active' && a.isActive) ||
            (filterStatus === 'inactive' && !a.isActive);
        return qMatch && catMatch && statusMatch;
    });

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-8 relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Kelola Pencapaian</h1>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                        CRUD badge pencapaian yang bisa diraih pengguna • {achievements.length} total
                    </p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Tambah Achievement
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                        type="text"
                        placeholder="Cari nama atau deskripsi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Select
                        icon={Filter}
                        value={filterCategory}
                        onChange={(val) => setFilterCategory(val as string)}
                        options={[
                            { label: 'Semua Kategori', value: 'all' },
                            ...CATEGORIES.map((c) => ({ label: c.label, value: c.value })),
                        ]}
                        placeholder=""
                    />
                    <Select
                        value={filterStatus}
                        onChange={(val) => setFilterStatus(val as string)}
                        options={[
                            { label: 'Semua Status', value: 'all' },
                            { label: 'Aktif', value: 'active' },
                            { label: 'Nonaktif', value: 'inactive' },
                        ]}
                        placeholder=""
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-stone-50 dark:bg-stone-900/50 border-b border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400">
                        <tr>
                            <th className="p-4 font-semibold w-14 text-center">Icon</th>
                            <th className="p-4 font-semibold">Nama & Deskripsi</th>
                            <th className="p-4 font-semibold">Kategori</th>
                            <th className="p-4 font-semibold">Trigger Condition</th>
                            <th className="p-4 font-semibold text-center">Aktif</th>
                            <th className="p-4 font-semibold text-center">User</th>
                            <th className="p-4 font-semibold text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                        {loading || seeding ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center">
                                    <div className="flex items-center justify-center gap-2 text-stone-500 dark:text-stone-400">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>{seeding ? 'Menanam data awal...' : 'Memuat...'}</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-stone-500 dark:text-stone-400">
                                    Tidak ada achievement yang cocok.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((ach) => (
                                <tr
                                    key={ach.id}
                                    className={`hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors ${!ach.isActive ? 'opacity-50' : ''}`}
                                >
                                    <td className="p-4 text-2xl text-center">{ach.icon}</td>
                                    <td className="p-4">
                                        <p className="font-bold text-stone-900 dark:text-stone-100">{ach.name}</p>
                                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 whitespace-normal max-w-[220px]">
                                            {ach.description}
                                        </p>
                                    </td>
                                    <td className="p-4">
                                        <CategoryBadge category={ach.category} />
                                    </td>
                                    <td className="p-4 text-stone-500 dark:text-stone-400 text-xs italic whitespace-normal max-w-[180px]">
                                        {ach.triggerCondition}
                                    </td>
                                    <td className="p-4 text-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={ach.isActive}
                                                onChange={() => handleToggleActive(ach.id, ach.isActive)}
                                            />
                                            <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                        </label>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="font-semibold text-stone-900 dark:text-stone-100">
                                            {userCounts[ach.id] || 0}
                                        </span>
                                        <span className="text-xs text-stone-400 ml-1">user</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => handleOpenEdit(ach)}
                                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirmId(ach.id)}
                                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ─── Add/Edit Slide-over Panel ─────────────────────────────────────── */}
            {isPanelOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-40"
                        onClick={() => !saving && setIsPanelOpen(false)}
                    />
                    <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[440px] bg-white dark:bg-stone-900 shadow-2xl border-l border-stone-200 dark:border-stone-700 flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Panel header */}
                        <div className="p-6 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between shrink-0 bg-stone-50 dark:bg-stone-900/50">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                                    {isEditing ? 'Edit Achievement' : 'Tambah Achievement'}
                                </h2>
                            </div>
                            <button
                                onClick={() => !saving && setIsPanelOpen(false)}
                                className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Panel body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <form id="achievement-form" onSubmit={handleSave} className="space-y-5">
                                {/* Icon + Nama */}
                                <div className="grid grid-cols-4 gap-3">
                                    <div className="col-span-1 space-y-1.5">
                                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                                            Icon <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.icon}
                                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                            placeholder="🏆"
                                            className="w-full text-center text-2xl px-2 py-2.5 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                        <p className="text-[10px] text-stone-400">Emoji</p>
                                    </div>
                                    <div className="col-span-3 space-y-1.5">
                                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                                            Nama Achievement <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Contoh: Veteran Pendaki"
                                            className="w-full px-3 py-2.5 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Kategori */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                                        Kategori
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {CATEGORIES.map((cat) => (
                                            <button
                                                key={cat.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, category: cat.value })}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                                                    formData.category === cat.value
                                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500'
                                                        : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                                                }`}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Deskripsi */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                                        Deskripsi <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Contoh: Selesaikan 10 trip pendakian"
                                        className="w-full px-3 py-2.5 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                    />
                                </div>

                                {/* Trigger Condition */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                                        Trigger Condition (ID) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.triggerCondition}
                                        onChange={(e) => setFormData({ ...formData, triggerCondition: e.target.value })}
                                        placeholder="Contoh: veteran-hiker"
                                        className="w-full px-3 py-2.5 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
                                    />
                                    <p className="text-[10px] text-stone-400 leading-relaxed">
                                        ID unik yang digunakan sistem untuk mencocokkan kondisi pencapaian. Gunakan
                                        format kebab-case.
                                    </p>
                                </div>

                                {/* Status aktif */}
                                <div className="flex items-center justify-between py-2 border-t border-stone-100 dark:border-stone-800">
                                    <div>
                                        <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                                            Status Badge
                                        </span>
                                        <p className="text-xs text-stone-400 mt-0.5">
                                            {formData.isActive
                                                ? 'Badge aktif & bisa diraih user'
                                                : 'Badge nonaktif, tersembunyi dari user'}
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.isActive ?? true}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                    </label>
                                </div>

                                {/* Preview */}
                                {(formData.name || formData.icon) && (
                                    <div className="border border-stone-200 dark:border-stone-700 rounded-xl p-4 bg-stone-50 dark:bg-stone-800/50">
                                        <p className="text-xs text-stone-400 mb-2 font-medium uppercase tracking-wide">
                                            Preview
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{formData.icon || '🏆'}</span>
                                            <div>
                                                <p className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                                                    {formData.name || 'Nama Achievement'}
                                                </p>
                                                <p className="text-xs text-stone-500">
                                                    {formData.description || 'Deskripsi achievement...'}
                                                </p>
                                                {formData.category && <CategoryBadge category={formData.category} />}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Panel footer */}
                        <div className="p-4 border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shrink-0 flex gap-3">
                            <button
                                type="button"
                                onClick={() => !saving && setIsPanelOpen(false)}
                                disabled={saving}
                                className="flex-1 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-medium hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-50 transition-colors text-sm"
                            >
                                Batal
                            </button>
                            <button
                                form="achievement-form"
                                type="submit"
                                disabled={saving}
                                className="flex-1 py-2.5 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-bold hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2 text-sm"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : isEditing ? (
                                    '💾 Perbarui'
                                ) : (
                                    '✅ Simpan'
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* ─── Delete Confirmation ───────────────────────────────────────────── */}
            {deleteConfirmId &&
                (() => {
                    const target = achievements.find((a) => a.id === deleteConfirmId);
                    const earnedCount = userCounts[deleteConfirmId] || 0;
                    return (
                        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                            <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                                        <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-stone-900 dark:text-stone-100">
                                            Hapus Achievement?
                                        </h3>
                                        <p className="text-xs text-stone-500 dark:text-stone-400">
                                            {target?.icon} {target?.name}
                                        </p>
                                    </div>
                                </div>

                                {earnedCount > 0 && (
                                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3">
                                        <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                                            ⚠️ <strong>{earnedCount} user</strong> sudah mendapatkan badge ini. Data
                                            riwayat mereka tidak ikut terhapus, hanya metadata achievement ini yang
                                            dihapus.
                                        </p>
                                    </div>
                                )}

                                <p className="text-stone-500 dark:text-stone-400 text-sm">
                                    Tindakan ini tidak dapat dibatalkan. Achievement akan dihapus permanen dari
                                    database.
                                </p>

                                <div className="flex gap-3 pt-1">
                                    <button
                                        onClick={() => setDeleteConfirmId(null)}
                                        disabled={deleting}
                                        className="flex-1 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-50 text-sm font-medium"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={() => handleDelete(deleteConfirmId)}
                                        disabled={deleting}
                                        className="flex-1 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {deleting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" /> Menghapus...
                                            </>
                                        ) : (
                                            'Hapus'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()}
        </div>
    );
}
