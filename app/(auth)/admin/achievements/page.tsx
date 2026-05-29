'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { Achievement } from '@/types';
import { toast } from 'sonner';
import { Award, Edit2, X, Info } from 'lucide-react';

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {id:'first-step', name:'Langkah Pertama', icon:'🥾', category:'explorer', description:'Selesaikan trip pertamamu', triggerCondition:'Selesaikan 1 trip', isActive:true},
  {id:'mountain-hopper', name:'Mountain Hopper', icon:'🏔️', category:'explorer', description:'Kunjungi 3 gunung berbeda', triggerCondition:'Selesaikan trip di 3 gunung berbeda', isActive:true},
  {id:'peak-collector', name:'Kolektor Puncak', icon:'🗻', category:'explorer', description:'Taklukkan 5 gunung berbeda', triggerCondition:'Selesaikan trip di 5 gunung berbeda', isActive:true},
  {id:'eco-starter', name:'Eco Starter', icon:'🌱', category:'eco', description:'Buat eco log pertamamu', triggerCondition:'Isi eco log di 1 trip selesai', isActive:true},
  {id:'waste-warrior', name:'Waste Warrior', icon:'♻️', category:'eco', description:'Kumpulkan 5kg sampah total', triggerCondition:'Total eco log mencapai 5 kg', isActive:true},
  {id:'forest-guardian', name:'Penjaga Hutan', icon:'🌳', category:'eco', description:'Raih eco score 100+', triggerCondition:'Eco score mencapai 100 poin', isActive:true},
  {id:'team-player', name:'Tim Solid', icon:'👥', category:'explorer', description:'Trip dengan 4+ anggota', triggerCondition:'Buat 1 trip minimal 4 orang', isActive:true},
  {id:'prepared-hiker', name:'Pendaki Siap', icon:'🎒', category:'safety', description:'Buat 3 packing list', triggerCondition:'Generate packing list untuk 3 trip', isActive:true},
  {id:'safety-first', name:'Safety First', icon:'🛡️', category:'safety', description:'Lakukan 5 safety check', triggerCondition:'Simpan safety check di 5 trip', isActive:true},
  {id:'trail-reporter', name:'Reporter Jalur', icon:'📢', category:'community', description:'Submit 3 laporan jalur', triggerCondition:'Kirim 3 laporan (disetujui)', isActive:true},
  {id:'trusted-reporter', name:'Reporter Terpercaya', icon:'⭐', category:'community', description:'Raih 5 laporan disetujui', triggerCondition:'5 laporanmu disetujui admin', isActive:true},
  {id:'veteran-hiker', name:'Veteran Pendaki', icon:'🎯', category:'explorer', description:'Selesaikan 10 trip', triggerCondition:'Selesaikan 10 trip pendakian', isActive:true}
];

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<Achievement | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch achievements metadata
        const achSnap = await getDocs(collection(db, 'achievements'));
        let loadedAch = achSnap.docs.map(d => d.data() as Achievement);
        
        // Seed if empty
        if (loadedAch.length === 0) {
          for (const a of DEFAULT_ACHIEVEMENTS) {
            await setDoc(doc(db, 'achievements', a.id), a);
          }
          loadedAch = [...DEFAULT_ACHIEVEMENTS];
        }
        
        // Ensure order by ID or Category
        loadedAch.sort((a,b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
        setAchievements(loadedAch);

        // Fetch counts from userAchievements
        const uaSnap = await getDocs(collection(db, 'userAchievements'));
        const counts: Record<string, number> = {};
        uaSnap.docs.forEach(d => {
          const achId = d.data().achievementId;
          counts[achId] = (counts[achId] || 0) + 1;
        });
        setUserCounts(counts);

      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat data pencapaian');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenEdit = (ach: Achievement) => {
    setEditingData({ ...ach });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingData) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'achievements', editingData.id), {
        name: editingData.name,
        icon: editingData.icon,
        description: editingData.description,
        category: editingData.category,
        isActive: editingData.isActive
      });
      
      setAchievements(prev => prev.map(a => a.id === editingData.id ? editingData : a));
      toast.success('Pencapaian berhasil diperbarui');
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Gagal memperbarui pencapaian');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'explorer': return <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-xs font-semibold">Explorer</span>;
      case 'eco': return <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">Eco</span>;
      case 'safety': return <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold">Safety</span>;
      case 'community': return <span className="px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs font-semibold">Komunitas</span>;
      default: return cat;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Kelola Pencapaian (Achievements)</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">Atur tampilan dan meta data badge pencapaian.</p>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-stone-50 dark:bg-stone-900/50 border-b border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400">
            <tr>
              <th className="p-4 font-semibold w-16 text-center">Icon</th>
              <th className="p-4 font-semibold">Nama</th>
              <th className="p-4 font-semibold">Kategori</th>
              <th className="p-4 font-semibold">Kondisi (Trigger)</th>
              <th className="p-4 font-semibold text-center">Status</th>
              <th className="p-4 font-semibold text-center">Jumlah User</th>
              <th className="p-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-stone-500">Memuat data...</td></tr>
            ) : achievements.map(ach => (
              <tr key={ach.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                <td className="p-4 text-center text-2xl">{ach.icon}</td>
                <td className="p-4 font-bold text-stone-900 dark:text-stone-100">
                  {ach.name}
                  <p className="font-normal text-xs text-stone-500 mt-0.5">{ach.description}</p>
                </td>
                <td className="p-4">{getCategoryLabel(ach.category)}</td>
                <td className="p-4 text-stone-600 dark:text-stone-300 italic text-xs">{ach.triggerCondition}</td>
                <td className="p-4 text-center">
                  {ach.isActive 
                    ? <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> 
                    : <span className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-600 inline-block"></span>}
                </td>
                <td className="p-4 text-center font-semibold text-stone-900 dark:text-stone-100">
                  {userCounts[ach.id] || 0}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleOpenEdit(ach)} className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors inline-block">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingData && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xl overflow-hidden animate-in zoom-in-95">
            
            <div className="p-4 border-b border-stone-200 dark:border-stone-700 flex justify-between items-center bg-stone-50 dark:bg-stone-900/50">
              <h2 className="font-bold text-stone-900 dark:text-stone-100">Edit Pencapaian</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl flex gap-3 items-start border border-blue-100 dark:border-blue-900/30 mb-2">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 dark:text-blue-300 font-medium leading-relaxed">
                  ID dan Kondisi (Trigger) sudah terhubung dengan sistem otomatis dan tidak dapat diubah di sini.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1 space-y-2">
                  <label className="block text-xs font-semibold text-stone-900 dark:text-stone-100">Icon (Emoji)</label>
                  <input type="text" required maxLength={2} value={editingData.icon} onChange={e => setEditingData({...editingData, icon: e.target.value})} className="w-full text-center text-xl px-2 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="col-span-3 space-y-2">
                  <label className="block text-xs font-semibold text-stone-900 dark:text-stone-100">Nama</label>
                  <input type="text" required value={editingData.name} onChange={e => setEditingData({...editingData, name: e.target.value})} className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-900 dark:text-stone-100">Deskripsi</label>
                <input type="text" required value={editingData.description} onChange={e => setEditingData({...editingData, description: e.target.value})} className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-900 dark:text-stone-100">Kategori</label>
                <select value={editingData.category} onChange={e => setEditingData({...editingData, category: e.target.value as any})} className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="explorer">Explorer</option>
                  <option value="eco">Eco</option>
                  <option value="safety">Safety</option>
                  <option value="community">Komunitas</option>
                </select>
              </div>

              <div className="space-y-2 opacity-60">
                <label className="block text-xs font-semibold text-stone-900 dark:text-stone-100">Kondisi (Read Only)</label>
                <input type="text" readOnly value={editingData.triggerCondition} className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 outline-none cursor-not-allowed text-xs" />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Aktifkan Badge</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={editingData.isActive} onChange={e => setEditingData({...editingData, isActive: e.target.checked})} />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={saving} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50">
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
