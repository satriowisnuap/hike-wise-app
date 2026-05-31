'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { User } from '@/types';
import Avatar from '@/components/Avatar';
import { toast } from 'sonner';
import { Search, ShieldAlert, ShieldCheck, Trash2, Filter, AlertTriangle } from 'lucide-react';
import Select from '@/components/Select';
import { useAuth } from '@/lib/auth-context';

export default function AdminUsersPage() {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, 'users'));
        const unsub = onSnapshot(q, (snap) => {
            setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as User));
        });
        return () => unsub();
    }, []);

    const handleToggleRole = async (userId: string, currentRole: 'admin' | 'user') => {
        if (userId === currentUser?.uid) {
            toast.error('Tidak bisa mengubah role akun sendiri');
            return;
        }
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            await updateDoc(doc(db, 'users', userId), { role: newRole });
            toast.success(`Role berhasil diubah menjadi ${newRole}`);
        } catch (err) {
            toast.error('Gagal mengubah role');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (userId === currentUser?.uid) {
            toast.error('Tidak bisa menghapus akun sendiri');
            setDeleteConfirmId(null);
            return;
        }
        try {
            await deleteDoc(doc(db, 'users', userId));
            toast.success('User berhasil dihapus dari database');
        } catch (err) {
            toast.error('Gagal menghapus user');
        } finally {
            setDeleteConfirmId(null);
        }
    };

    const filtered = users.filter((u) => {
        const qMatch =
            (u.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        const roleMatch = filterRole === 'all' || u.role === filterRole;
        return qMatch && roleMatch;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-8 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Kelola Pengguna</h1>
                    <p className="text-sm text-stone-500 dark:text-stone-400">Manajemen akun user dan hak akses.</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                        type="text"
                        placeholder="Cari nama atau email..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <div className="flex gap-2">
                    <Select
                        icon={Filter}
                        value={filterRole}
                        onChange={(val) => {
                            setFilterRole(val as string);
                            setPage(1);
                        }}
                        options={[
                            { label: 'Semua Role', value: 'all' },
                            { label: 'User', value: 'user' },
                            { label: 'Admin', value: 'admin' },
                        ]}
                        placeholder=""
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-stone-50 dark:bg-stone-900/50 border-b border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400">
                        <tr>
                            <th className="p-4 font-semibold">User</th>
                            <th className="p-4 font-semibold">Email</th>
                            <th className="p-4 font-semibold">Role</th>
                            <th className="p-4 font-semibold">Total Trip</th>
                            <th className="p-4 font-semibold">Eco Score</th>
                            <th className="p-4 font-semibold">Terdaftar</th>
                            <th className="p-4 font-semibold text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                        {paginated.map((u) => (
                            <tr key={u.uid} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar name={u.name || 'U'} size="sm" />
                                        <span className="font-bold text-stone-900 dark:text-stone-100">
                                            {u.name || 'Tanpa Nama'}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 text-stone-600 dark:text-stone-300">{u.email}</td>
                                <td className="p-4">
                                    {u.role === 'admin' ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs font-semibold">
                                            <ShieldCheck className="w-3 h-3" /> Admin
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-400 text-xs font-semibold">
                                            User
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 font-medium text-stone-900 dark:text-stone-100">
                                    {u.totalTrips || 0}
                                </td>
                                <td className="p-4 font-medium text-emerald-600 dark:text-emerald-400">
                                    {u.ecoScore || 0} pts
                                </td>
                                <td className="p-4 text-stone-500 dark:text-stone-400">
                                    {u.createdAt?.toDate().toLocaleDateString('id-ID')}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleToggleRole(u.uid, u.role)}
                                            disabled={u.uid === currentUser?.uid}
                                            title={u.role === 'admin' ? 'Cabut akses admin' : 'Jadikan admin'}
                                            className={`p-1.5 rounded-lg transition-colors ${u.role === 'admin' ? 'text-amber-600 hover:bg-amber-50 dark:text-amber-500 dark:hover:bg-amber-900/30' : 'text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/30'} disabled:opacity-30`}
                                        >
                                            {u.role === 'admin' ? (
                                                <ShieldAlert className="w-4 h-4" />
                                            ) : (
                                                <ShieldCheck className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirmId(u.uid)}
                                            disabled={u.uid === currentUser?.uid}
                                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors disabled:opacity-30"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {paginated.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-stone-500 dark:text-stone-400">
                                    Tidak ada data pengguna.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="p-4 border-t border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50 flex justify-between items-center text-sm">
                        <span className="text-stone-500 dark:text-stone-400">
                            Halaman {page} dari {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="px-3 py-1 rounded bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="px-3 py-1 rounded bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation */}
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-500 mb-4">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">Hapus Pengguna?</h3>
                        <p className="text-stone-500 dark:text-stone-400 text-sm mb-6">
                            User ini akan dihapus dari Firestore. Semua trip dan log miliknya bisa menjadi yatim piatu.
                            Lanjutkan?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="flex-1 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleDeleteUser(deleteConfirmId)}
                                className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
