'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, doc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { Mountain } from '@/types';
import { toast } from 'sonner';
import { Plus, Search, Filter, Edit2, Trash2, X, Loader2 } from 'lucide-react';

const PROVINCES = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi", "Bengkulu",
  "Sumatera Selatan", "Kepulauan Bangka Belitung", "Lampung", "DKI Jakarta", "Jawa Barat",
  "Banten", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", "Bali", "Nusa Tenggara Barat",
  "Nusa Tenggara Timur", "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan",
  "Kalimantan Timur", "Kalimantan Utara", "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah",
  "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara", "Maluku", "Maluku Utara",
  "Papua Barat", "Papua"
];

// ─── Utility: format angka dengan titik ribuan ───────────────────────────────
function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? value.replace(/\D/g, '') : String(value);
  if (!num) return '';
  return Number(num).toLocaleString('id-ID');
}

// ─── Komponen Input Angka dengan Format Otomatis ─────────────────────────────
interface NumberInputProps {
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  className?: string;
  min?: number;
}

function NumberInput({ value, onChange, placeholder, className, min = 0 }: NumberInputProps) {
  const [display, setDisplay] = useState(value > 0 ? formatNumber(value) : '');

  useEffect(() => {
    setDisplay(value > 0 ? formatNumber(value) : '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, '').replace(/,/g, '');
    // Hanya izinkan digit
    if (raw !== '' && !/^\d+$/.test(raw)) return;
    const num = Number(raw) || 0;
    if (num < min && raw !== '') return;
    setDisplay(raw === '' ? '' : formatNumber(raw));
    onChange(num);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Izinkan: Backspace, Delete, Tab, Escape, Enter, Arrow keys, Home, End
    const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (allowed.includes(e.key)) return;
    // Blokir non-digit
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={className}
    />
  );
}

export default function AdminMountainsPage() {
  const [mountains, setMountains] = useState<Mountain[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Slide-over state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMountainId, setCurrentMountainId] = useState('');

  // Form state
  const [formData, setFormData] = useState<Partial<Mountain>>({
    name: '', province: 'Jawa Barat', altitude: 0, difficulty: 'medium',
    description: '', baseCamp: '', entryFee: 0, isOpen: true
  });
  const [saving, setSaving] = useState(false);

  // Delete Confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'mountains'));
    const unsub = onSnapshot(q, (snap) => {
      setMountains(snap.docs.map(d => ({ id: d.id, ...d.data() } as Mountain)));
    }, (error) => {
      console.error('Error listening to mountains:', error);
      toast.error('Gagal memuat data gunung');
    });
    return () => unsub();
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      name: '', province: 'Jawa Barat', altitude: 0, difficulty: 'medium',
      description: '', baseCamp: '', entryFee: 0, isOpen: true
    });
    setIsEditing(false);
    setCurrentMountainId('');
  }, []);

  const handleOpenAdd = () => {
    resetForm();
    setIsPanelOpen(true);
  };

  const handleOpenEdit = (m: Mountain) => {
    resetForm();
    setFormData({ ...m });
    setCurrentMountainId(m.id);
    setIsEditing(true);
    setIsPanelOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi manual
    if (!formData.name?.trim()) {
      toast.error('Nama gunung wajib diisi');
      return;
    }
    if ((formData.altitude || 0) <= 0) {
      toast.error('Ketinggian harus lebih dari 0');
      return;
    }
    if ((formData.description?.length || 0) < 100) {
      toast.error('Deskripsi minimal 100 karakter');
      return;
    }

    setSaving(true);
    try {
      const mId = isEditing ? currentMountainId : `mt-${Date.now()}`;

      const mData: Record<string, unknown> = {
        name: formData.name?.trim() || '',
        province: formData.province || 'Jawa Barat',
        altitude: formData.altitude || 0,
        difficulty: formData.difficulty || 'medium',
        description: formData.description?.trim() || '',
        baseCamp: formData.baseCamp?.trim() || '',
        entryFee: formData.entryFee || 0,
        isOpen: formData.isOpen ?? true,
        updatedAt: Timestamp.now(),
      };

      if (!isEditing) {
        mData.createdAt = Timestamp.now();
      }

      await setDoc(doc(db, 'mountains', mId), mData, { merge: true });
      toast.success(isEditing ? 'Gunung berhasil diperbarui!' : 'Gunung berhasil ditambahkan!');
      setIsPanelOpen(false);
      resetForm();
    } catch (err: unknown) {
      console.error('Save error:', err);
      const message = err instanceof Error ? err.message : 'Kesalahan tidak diketahui';
      toast.error('Gagal menyimpan: ' + message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'mountains', id), { isOpen: !currentStatus, updatedAt: Timestamp.now() });
      toast.success('Status berhasil diubah');
    } catch {
      toast.error('Gagal mengubah status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'mountains', id));
      toast.success('Gunung berhasil dihapus');
    } catch {
      toast.error('Gagal menghapus gunung');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Filter & Pagination
  const filtered = mountains.filter(m => {
    const qMatch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const diffMatch = filterDifficulty === 'all' || m.difficulty === filterDifficulty;
    const statusMatch = filterStatus === 'all' ||
      (filterStatus === 'open' && m.isOpen) ||
      (filterStatus === 'closed' && !m.isOpen);
    return qMatch && diffMatch && statusMatch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getDifficultyBadge = (d: string) => {
    switch (d) {
      case 'easy': return <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Mudah</span>;
      case 'medium': return <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Sedang</span>;
      case 'hard': return <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Sulit</span>;
      case 'expert': return <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Ekstrem</span>;
      default: return null;
    }
  };

  const descLen = formData.description?.length || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8 relative">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Kelola Gunung</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">Manajemen direktori gunung untuk aplikasi.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> Tambah Gunung
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text" placeholder="Cari nama gunung..."
            value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            <select
              value={filterDifficulty} onChange={e => { setFilterDifficulty(e.target.value); setPage(1); }}
              className="pl-9 pr-8 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 outline-none appearance-none"
            >
              <option value="all">Semua Kesulitan</option>
              <option value="easy">Mudah</option>
              <option value="medium">Sedang</option>
              <option value="hard">Sulit</option>
              <option value="expert">Ekstrem</option>
            </select>
          </div>
          <select
            value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="open">Dibuka</option>
            <option value="closed">Ditutup</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-stone-50 dark:bg-stone-900/50 border-b border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400">
            <tr>
              <th className="p-4 font-semibold">Nama</th>
              <th className="p-4 font-semibold">Provinsi</th>
              <th className="p-4 font-semibold">Ketinggian</th>
              <th className="p-4 font-semibold">Kesulitan</th>
              <th className="p-4 font-semibold text-center">Status</th>
              <th className="p-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {paginated.map(m => (
              <tr key={m.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                <td className="p-4 font-bold text-stone-900 dark:text-stone-100">{m.name}</td>
                <td className="p-4 text-stone-600 dark:text-stone-300">{m.province}</td>
                <td className="p-4 text-stone-600 dark:text-stone-300">{formatNumber(m.altitude)} mdpl</td>
                <td className="p-4">{getDifficultyBadge(m.difficulty)}</td>
                <td className="p-4 text-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={m.isOpen} onChange={() => handleToggleStatus(m.id, m.isOpen)} />
                    <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenEdit(m)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteConfirmId(m.id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-stone-500 dark:text-stone-400">Tidak ada data gunung.</td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="p-4 border-t border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50 flex justify-between items-center text-sm">
            <span className="text-stone-500 dark:text-stone-400">Halaman {page} dari {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 disabled:opacity-50">Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Slide-over Panel */}
      {isPanelOpen && (
        <>
          <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-40 transition-opacity" onClick={() => !saving && setIsPanelOpen(false)}></div>
          <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[420px] bg-white dark:bg-stone-900 shadow-2xl border-l border-stone-200 dark:border-stone-700 flex flex-col animate-in slide-in-from-right duration-300">

            <div className="p-6 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between shrink-0 bg-stone-50 dark:bg-stone-900/50">
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">{isEditing ? 'Edit Gunung' : 'Tambah Gunung'}</h2>
              <button onClick={() => !saving && setIsPanelOpen(false)} className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="mountain-form" onSubmit={handleSave} className="space-y-5">

                {/* Nama Gunung */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">Nama Gunung <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Semeru"
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Provinsi */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">Provinsi <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={formData.province}
                    onChange={e => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* Ketinggian & Kesulitan */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">Ketinggian (mdpl) <span className="text-red-500">*</span></label>
                    <NumberInput
                      value={formData.altitude || 0}
                      onChange={val => setFormData({ ...formData, altitude: val })}
                      placeholder="Contoh: 3.676"
                      min={0}
                      className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">Kesulitan</label>
                    <select
                      value={formData.difficulty}
                      onChange={e => setFormData({ ...formData, difficulty: e.target.value as Mountain['difficulty'] })}
                      className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="easy">Mudah</option>
                      <option value="medium">Sedang</option>
                      <option value="hard">Sulit</option>
                      <option value="expert">Ekstrem</option>
                    </select>
                  </div>
                </div>

                {/* Deskripsi */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">
                    Deskripsi <span className="text-red-500">*</span>
                    <span className="font-normal text-stone-400 ml-1">(min. 100 karakter)</span>
                  </label>
                  <textarea
                    required
                    minLength={100}
                    rows={5}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Deskripsikan gunung secara lengkap..."
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                  <div className={`text-right text-xs ${descLen < 100 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {descLen} / 100 karakter minimum
                  </div>
                </div>

                {/* Basecamp */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">Lokasi Basecamp</label>
                  <input
                    type="text"
                    value={formData.baseCamp}
                    onChange={e => setFormData({ ...formData, baseCamp: e.target.value })}
                    placeholder="Contoh: Desa Ranupane, Malang"
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Biaya Pendakian */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">Biaya Pendakian (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-medium pointer-events-none">Rp</span>
                    <NumberInput
                      value={formData.entryFee || 0}
                      onChange={val => setFormData({ ...formData, entryFee: val })}
                      placeholder="Contoh: 25.000"
                      min={0}
                      className="w-full pl-9 pr-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Status Pendakian</span>
                    <p className="text-xs text-stone-400 mt-0.5">{formData.isOpen ? 'Dibuka untuk pendaki' : 'Ditutup sementara'}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.isOpen}
                      onChange={e => setFormData({ ...formData, isOpen: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shrink-0">
              {descLen < 100 && descLen > 0 && (
                <p className="text-xs text-amber-500 mb-2 text-center">
                  Deskripsi kurang {100 - descLen} karakter lagi
                </p>
              )}
              <button
                form="mountain-form"
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-bold hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  isEditing ? '💾 Perbarui Gunung' : '✅ Simpan Gunung'
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">Hapus Gunung?</h3>
            <p className="text-stone-500 dark:text-stone-400 text-sm mb-6">Tindakan ini tidak dapat dibatalkan. Data gunung akan dihapus permanen dari database.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800">
                Batal
              </button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
