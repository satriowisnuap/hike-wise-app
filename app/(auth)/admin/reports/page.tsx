'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, deleteDoc, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { TrailReport, Mountain } from '@/types';
import Avatar from '@/components/Avatar';
import { toast } from 'sonner';
import { MessageSquare, CheckCircle, XCircle, Cloud, Search, Filter, Trash2, Plus, AlertTriangle, X, Info } from 'lucide-react';
import { checkAndAwardAchievements } from '@/lib/achievement-checker';
import { useAuth } from '@/lib/auth-context';
import Select from '@/components/Select';

export default function AdminReportsPage() {
  const { currentUser: user } = useAuth();

  const [reports, setReports] = useState<TrailReport[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Reject Dialog
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete Dialog
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMountainId, setFormMountainId] = useState('');
  const [formCondition, setFormCondition] = useState<'good' | 'caution' | 'danger'>('good');
  const [formWeather, setFormWeather] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [mountains, setMountains] = useState<Mountain[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'reports'), where('status', '==', activeTab), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() } as TrailReport)));
    });
    return () => unsub();
  }, [activeTab]);

  useEffect(() => {
    const fetchMountains = async () => {
      try {
        const q = query(collection(db, 'mountains'));
        const snap = await getDocs(q);
        setMountains(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Mountain));
      } catch (err) {
        console.error('Error fetching mountains:', err);
      }
    };
    fetchMountains();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formMountainId || !formWeather || formDesc.length < 50) return;

    const m = mountains.find((m) => m.id === formMountainId);
    if (!m) return;

    setSubmitting(true);
    try {
      const report: Omit<TrailReport, 'id'> = {
        userId: user.uid,
        userName: user.displayName || 'Admin',
        mountainId: m.id,
        mountainName: m.name,
        condition: formCondition,
        weather: formWeather,
        description: formDesc,
        status: 'approved',
        rejectionNote: '',
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'reports'), report);
      toast.success('Laporan berhasil dibuat dan langsung disetujui!');

      setIsModalOpen(false);
      setFormMountainId('');
      setFormWeather('');
      setFormDesc('');
      setFormCondition('good');
    } catch (err) {
      console.error('Submit report error:', err);
      toast.error('Gagal membuat laporan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (report: TrailReport) => {
    try {
      await updateDoc(doc(db, 'reports', report.id), { status: 'approved' });
      toast.success('Laporan disetujui');
      // Trigger achievement check for the reporter
      if (report.userId) {
        await checkAndAwardAchievements(report.userId);
      }
    } catch (err) {
      toast.error('Gagal menyetujui laporan');
    }
  };

  const selectedReport = reports.find(r => r.id === rejectingId);
  const isCurrentlyApproved = selectedReport?.status === 'approved';

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId) return;
    setSubmitting(true);
    try {
      await updateDoc(doc(db, 'reports', rejectingId), { 
        status: 'rejected', 
        rejectionNote: rejectNote 
      });
      toast.success(isCurrentlyApproved ? 'Laporan dinonaktifkan' : 'Laporan ditolak');
      setRejectingId(null);
      setRejectNote('');
    } catch (err) {
      toast.error(isCurrentlyApproved ? 'Gagal menonaktifkan laporan' : 'Gagal menolak laporan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reports', id));
      toast.success('Laporan berhasil dihapus');
      setDeletingId(null);
    } catch (err) {
      toast.error('Gagal menghapus laporan');
    }
  };

  const filtered = reports.filter(r => 
    r.mountainName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getConditionBadge = (c: string) => {
    if (c === 'good') return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Aman</span>;
    if (c === 'caution') return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">Waspada</span>;
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">Berbahaya</span>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8 relative">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Moderasi Laporan</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">Tinjau laporan kondisi jalur dari pengguna.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> Buat Laporan
        </button>
      </div>

      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-xl w-full md:w-auto">
          {[
            { id: 'pending', label: 'Menunggu Review' },
            { id: 'approved', label: 'Disetujui' },
            { id: 'rejected', label: 'Ditolak' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab.id 
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm' 
                  : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input 
            type="text" placeholder="Cari gunung, user, isi..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(report => (
          <div key={report.id} className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-5 shadow-sm flex flex-col md:flex-row gap-6">
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-stone-900 dark:text-stone-100">{report.mountainName}</span>
                {getConditionBadge(report.condition)}
                <span className="text-xs text-stone-500 ml-2">{report.createdAt?.toDate().toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'})}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/50 p-2 rounded-lg border border-stone-100 dark:border-stone-800 w-fit">
                <Cloud className="w-4 h-4 text-stone-400" /> {report.weather}
              </div>
              
              <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed bg-stone-50/50 dark:bg-stone-800/20 p-4 rounded-xl">
                {report.description}
              </p>
              
              {activeTab === 'rejected' && report.rejectionNote && (
                <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400">
                  <span className="font-bold">Alasan Penolakan:</span> {report.rejectionNote}
                </div>
              )}
            </div>

            <div className="md:w-64 shrink-0 flex flex-col justify-between border-t md:border-t-0 md:border-l border-stone-200 dark:border-stone-700 pt-4 md:pt-0 md:pl-6">
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={report.userName} size="md" />
                <div>
                  <p className="font-bold text-sm text-stone-900 dark:text-stone-100">{report.userName}</p>
                  <p className="text-xs text-stone-500">Reporter</p>
                </div>
              </div>
              
              {activeTab === 'pending' && (
                <div className="flex flex-col gap-2 mt-auto">
                  <button onClick={() => handleApprove(report)} className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Setujui Laporan
                  </button>
                  <button onClick={() => setRejectingId(report.id)} className="w-full py-2.5 rounded-xl border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex justify-center items-center gap-2">
                    <XCircle className="w-4 h-4" /> Tolak Laporan
                  </button>
                  <button onClick={() => setDeletingId(report.id)} className="w-full py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300 text-sm font-bold hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors flex justify-center items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Hapus Laporan
                  </button>
                </div>
              )}
              {activeTab === 'approved' && (
                <div className="flex flex-col gap-2 mt-auto">
                  <button onClick={() => setRejectingId(report.id)} className="w-full py-2.5 rounded-xl border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex justify-center items-center gap-2">
                    <XCircle className="w-4 h-4" /> Nonaktifkan Laporan
                  </button>
                  <button onClick={() => setDeletingId(report.id)} className="w-full py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300 text-sm font-bold hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors flex justify-center items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Hapus Laporan
                  </button>
                </div>
              )}
              {activeTab === 'rejected' && (
                <div className="flex flex-col gap-2 mt-auto">
                  <button onClick={() => handleApprove(report)} className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Setujui Laporan
                  </button>
                  <button onClick={() => setDeletingId(report.id)} className="w-full py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300 text-sm font-bold hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors flex justify-center items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Hapus Laporan
                  </button>
                </div>
              )}
            </div>
            
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700">
            <MessageSquare className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
            <p className="text-stone-500 dark:text-stone-400 font-medium">Tidak ada laporan di tab ini.</p>
          </div>
        )}
      </div>

      {/* Reject / Deactivate Dialog */}
      {rejectingId && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <form onSubmit={handleReject} className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isCurrentlyApproved ? 'Nonaktifkan Laporan' : 'Tolak Laporan'}
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-2">
                {isCurrentlyApproved 
                  ? 'Laporan yang dinonaktifkan tidak akan tampil di halaman komunitas. Berikan alasan penonaktifan untuk reporter.' 
                  : 'Laporan yang ditolak tidak akan tampil di halaman komunitas. Berikan alasan penolakan untuk reporter.'}
              </p>
              
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-900 dark:text-stone-100">
                  {isCurrentlyApproved ? 'Alasan Penonaktifan' : 'Alasan Penolakan'}
                </label>
                <textarea 
                  required rows={3}
                  value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                  placeholder={isCurrentlyApproved ? 'Misal: Laporan sudah tidak relevan, data kurang akurat...' : 'Misal: Info tidak relevan, mengandung unsur SARA...'}
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => {setRejectingId(null); setRejectNote('');}} className="flex-1 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold hover:bg-stone-50 dark:hover:bg-stone-800">
                  Batal
                </button>
                <button type="submit" disabled={submitting || !rejectNote} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50">
                  {submitting ? 'Menyimpan...' : (isCurrentlyApproved ? 'Nonaktifkan Laporan' : 'Tolak Laporan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingId && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Hapus Laporan</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Apakah Anda yakin ingin menghapus laporan ini secara permanen? Tindakan ini tidak dapat dibatalkan.
              </p>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setDeletingId(null)} 
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  Batal
                </button>
                <button 
                  type="button" 
                  onClick={() => handleDelete(deletingId)} 
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700"
                >
                  Hapus Permanen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buat Laporan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-stone-200 dark:border-stone-700 flex justify-between items-center bg-stone-50 dark:bg-stone-900/50">
              <h2 className="font-bold text-stone-900 dark:text-stone-100">Buat Laporan Baru (Admin)</h2>
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
                  Sebagai admin, laporan yang Anda buat akan langsung berstatus disetujui (Approved) dan langsung dipublikasikan.
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
