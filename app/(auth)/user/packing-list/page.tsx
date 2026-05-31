'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Trip, PackingCategory } from '@/types';
import { generatePackingList, PackingInput } from '@/lib/packing-list';
import { toast } from 'sonner';
import { Backpack, Sun, CloudRain, Mountain, ChevronDown, Check, Printer, Save, Loader2, Compass, Tent } from 'lucide-react';

export default function PackingListPage() {
  const { currentUser: user } = useAuth();
  
  // Input State
  const [tripType, setTripType] = useState<'day-hike' | 'overnight' | 'expedition'>('day-hike');
  const [season, setSeason] = useState<'dry' | 'wet'>('dry');
  const [duration, setDuration] = useState<number>(1);
  const [members, setMembers] = useState<number>(1);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('easy');
  
  // Results State
  const [packingList, setPackingList] = useState<PackingCategory[] | null>(null);
  
  // Trips State for saving
  const [plannedTrips, setPlannedTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchTrips = async () => {
      setLoadingTrips(true);
      try {
        const q = query(
          collection(db, 'trips'), 
          where('userId', '==', user.uid),
          where('status', '==', 'planned')
        );
        const snapshot = await getDocs(q);
        const trips = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Trip));
        setPlannedTrips(trips);
      } catch (err) {
        console.error('Error fetching planned trips:', err);
      } finally {
        setLoadingTrips(false);
      }
    };
    fetchTrips();
  }, [user]);

  useEffect(() => {
    const trip = plannedTrips.find(t => t.id === selectedTripId);
    if (trip) {
      setDuration(trip.duration);
      setMembers(trip.members);
      if (trip.mountainDifficulty) {
        setDifficulty(trip.mountainDifficulty);
      }
    }
  }, [selectedTripId, plannedTrips]);

  const handleGenerate = () => {
    const input: PackingInput = { duration, tripType, season, members, difficulty };
    const result = generatePackingList(input);
    setPackingList(result);
  };

  const handleToggleItem = (categoryIndex: number, itemIndex: number) => {
    if (!packingList) return;
    const newList = [...packingList];
    const current = newList[categoryIndex].items[itemIndex].checked;
    newList[categoryIndex].items[itemIndex].checked = !current;
    setPackingList(newList);
  };

  const handleSaveToTrip = async () => {
    if (!selectedTripId || !packingList) return;
    setSaving(true);
    try {
      const tripRef = doc(db, 'trips', selectedTripId);
      await updateDoc(tripRef, {
        packingList
      });
      const tripName = plannedTrips.find(t => t.id === selectedTripId)?.mountainName;
      toast.success(`Packing list tersimpan ke ${tripName}`);
    } catch (err) {
      console.error('Error saving packing list:', err);
      toast.error('Gagal menyimpan packing list');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Derived stats
  const totalItems = packingList ? packingList.reduce((acc, cat) => acc + cat.items.length, 0) : 0;
  const essentialItems = packingList ? packingList.reduce((acc, cat) => acc + cat.items.filter(i => i.isEssential).length, 0) : 0;
  const checkedItems = packingList ? packingList.reduce((acc, cat) => acc + cat.items.filter(i => i.checked).length, 0) : 0;
  const progressPercent = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="space-y-2 print:hidden">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Backpack className="w-6 h-6 text-emerald-600 dark:text-emerald-500" /> Packing List Generator
        </h1>
        <p className="text-stone-500 dark:text-stone-400">Buat daftar perlengkapan yang presisi sesuai dengan rencana pendakian Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* INPUT FORM */}
        <div className="lg:col-span-4 space-y-6 print:hidden">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 space-y-6 shadow-sm">
            
            {/* Trip Selector */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">Pilih Trip Terencana (Opsional)</label>
              <select 
                value={selectedTripId}
                onChange={e => setSelectedTripId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Pilih Trip --</option>
                {plannedTrips.map(t => (
                  <option key={t.id} value={t.id}>{t.title ? `${t.title} (${t.mountainName})` : t.mountainName}</option>
                ))}
              </select>
            </div>

            {/* Trip Type */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">Tipe Perjalanan</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'day-hike', label: 'Day Hike', icon: <Mountain className="w-5 h-5" /> },
                  { id: 'overnight', label: 'Overnight', icon: <Tent className="w-5 h-5" /> },
                  { id: 'expedition', label: 'Ekspedisi', icon: <Compass className="w-5 h-5" /> }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setTripType(type.id as any)}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                      tripType === type.id
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500'
                        : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:border-emerald-300 dark:hover:border-emerald-700'
                    }`}
                  >
                    {type.icon} <span className="font-medium text-sm">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Season */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">Musim</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSeason('dry')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    season === 'dry'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500'
                      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:border-amber-300 dark:hover:border-amber-700'
                  }`}
                >
                  <Sun className="w-5 h-5" /> <span className="font-medium text-sm">Kemarau</span>
                </button>
                <button
                  onClick={() => setSeason('wet')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    season === 'wet'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 ring-1 ring-blue-500'
                      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <CloudRain className="w-5 h-5" /> <span className="font-medium text-sm">Hujan</span>
                </button>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">Durasi (Hari)</label>
              <input 
                type="number" 
                min="1" 
                max="14" 
                value={duration} 
                onChange={e => setDuration(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none"
              />
            </div>

            {/* Members */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">Jumlah Anggota</label>
              <input 
                type="number" 
                min="1" 
                max="20" 
                value={members} 
                onChange={e => setMembers(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none"
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">Kesulitan Gunung</label>
              <div className="relative">
                <select 
                  value={difficulty} 
                  onChange={e => setDifficulty(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none appearance-none"
                >
                  <option value="easy">Mudah</option>
                  <option value="medium">Sedang</option>
                  <option value="hard">Sulit</option>
                  <option value="expert">Ekstrem</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500 pointer-events-none" />
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              className="w-full py-4 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-bold hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors"
            >
              Buat Packing List
            </button>
          </div>
        </div>

        {/* RESULTS */}
        <div className="lg:col-span-8 space-y-6">
          {packingList ? (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden print:border-none print:shadow-none">
              
              {/* Results Header */}
              <div className="p-6 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50 print:bg-transparent print:border-b-2 print:border-black">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Daftar Perlengkapan</h2>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Total {totalItems} item ({essentialItems} item wajib)</p>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto print:hidden">
                    <button 
                      onClick={handlePrint}
                      className="p-2 rounded-lg border border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                      title="Cetak"
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                    <div className="flex flex-1 sm:flex-none items-center gap-2">
                      <button 
                        onClick={handleSaveToTrip}
                        disabled={!selectedTripId || saving}
                        className="px-4 py-2 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span className="hidden sm:inline">Simpan</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-stone-900 dark:text-stone-100">Kesiapan</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{checkedItems}/{totalItems} item siap</span>
                  </div>
                  <div className="h-2 w-full bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Accordion List */}
              <div className="p-0 sm:p-6 print:p-0">
                <div className="space-y-4">
                  {packingList.map((category, catIdx) => (
                    <details key={category.category} className="group rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 overflow-hidden print:border-none print:break-inside-avoid" open>
                      <summary className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-900/50 cursor-pointer select-none print:bg-transparent print:p-2 print:border-b print:border-black">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{category.icon}</span>
                          <span className="font-bold text-stone-900 dark:text-stone-100">{category.category}</span>
                          <span className="text-xs px-2 py-1 bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-full font-medium">
                            {category.items.length} item
                          </span>
                        </div>
                        <ChevronDown className="w-5 h-5 text-stone-500 transition-transform group-open:rotate-180 print:hidden" />
                      </summary>
                      
                      <div className="p-4 space-y-2 print:p-2">
                        {category.items.map((item, itemIdx) => (
                          <div 
                            key={item.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors group/item"
                          >
                            <label className="flex items-center gap-3 flex-1 cursor-pointer">
                              <div className="relative flex items-center justify-center">
                                <input 
                                  type="checkbox"
                                  checked={item.checked}
                                  onChange={() => handleToggleItem(catIdx, itemIdx)}
                                  className="peer appearance-none w-5 h-5 border-2 border-stone-300 dark:border-stone-600 rounded checked:bg-emerald-500 checked:border-emerald-500 transition-all"
                                />
                                <Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                              </div>
                              <span className={`text-sm md:text-base font-medium transition-colors ${item.checked ? 'text-stone-400 dark:text-stone-500 line-through' : 'text-stone-900 dark:text-stone-100'}`}>
                                {item.name}
                              </span>
                            </label>
                            
                            <div className="flex items-center gap-3 ml-4">
                              <span className="text-xs font-semibold bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-2 py-1 rounded">
                                {item.quantity} {item.unit}
                              </span>
                              {item.isEssential && (
                                <span className="text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full uppercase tracking-wider">
                                  Wajib
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 print:hidden text-center p-8">
              <Backpack className="w-16 h-16 text-stone-300 dark:text-stone-600 mb-4" />
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">Belum Ada Packing List</h3>
              <p className="text-stone-500 dark:text-stone-400 max-w-sm">Isi detail perjalanan Anda di form sebelah kiri dan klik tombol "Buat Packing List" untuk melihat hasil.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
