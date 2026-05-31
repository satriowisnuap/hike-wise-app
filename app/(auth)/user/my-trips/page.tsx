'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, Timestamp, increment, getDoc } from 'firebase/firestore';
import { Trip, Mountain } from '@/types';
import { checkAndAwardAchievements } from '@/lib/achievement-checker';
import { toast } from 'sonner';
import { Map, Calendar, Users, ShieldCheck, Check, Clock, Play, MapPin, X, Leaf, Backpack, Compass, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MyTripsPage() {
  const { currentUser: user } = useAuth();
  const router = useRouter();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [mountains, setMountains] = useState<Record<string, Mountain>>({});
  const [loading, setLoading] = useState(true);

  // Filters & Sort
  const [filter, setFilter] = useState<'all' | 'planned' | 'ongoing' | 'completed'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Selected Trip
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'packing' | 'eco'>('itinerary');

  // Eco Form
  const [wasteKg, setWasteKg] = useState<number | ''>('');
  const [ecoNotes, setEcoNotes] = useState('');
  const [savingEco, setSavingEco] = useState(false);

  // Packing List debounce
  const packingSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;
    
    // Fetch mountains once for images
    const fetchMountains = async () => {
      try {
        const mSnapshot = await getDoc(doc(db, 'system', 'dummy')); // Just to show we could fetch them or just rely on trips.
        // Actually we need to fetch all mountains to get their images.
        // For now, let's just use a dummy background if image is missing.
      } catch (e) {}
    };

    const q = query(collection(db, 'trips'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTrips = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Trip));
      setTrips(fetchedTrips);
      setLoading(false);

      // Update selected trip if it's currently open
      if (selectedTrip) {
        const updated = fetchedTrips.find(t => t.id === selectedTrip.id);
        if (updated) setSelectedTrip(updated);
      }
    });

    return () => unsubscribe();
  }, [user, selectedTrip]);

  const filteredTrips = trips
    .filter(t => filter === 'all' ? true : t.status === filter)
    .sort((a, b) => {
      const timeA = a.startDate.toMillis();
      const timeB = b.startDate.toMillis();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

  const formatDate = (ts: Timestamp) => {
    return ts.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleStatusChange = async (newStatus: 'ongoing' | 'completed') => {
    if (!selectedTrip || !user) return;
    try {
      const tripRef = doc(db, 'trips', selectedTrip.id);
      await updateDoc(tripRef, { status: newStatus });
      
      if (newStatus === 'completed') {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { totalTrips: increment(1) });
        await checkAndAwardAchievements(user.uid);
        toast.success('Pendakian selesai! Selamat beristirahat.');
      } else {
        toast.success('Status diubah menjadi Berlangsung. Hati-hati di jalan!');
      }
    } catch (err) {
      toast.error('Gagal memperbarui status');
    }
  };

  const handlePackingToggle = (catIdx: number, itemIdx: number) => {
    if (!selectedTrip || !selectedTrip.packingList) return;
    const newPacking = [...selectedTrip.packingList];
    newPacking[catIdx].items[itemIdx].checked = !newPacking[catIdx].items[itemIdx].checked;
    
    // Optimistic update
    setSelectedTrip({ ...selectedTrip, packingList: newPacking });

    // Debounce save to Firestore
    if (packingSaveTimeout.current) clearTimeout(packingSaveTimeout.current);
    packingSaveTimeout.current = setTimeout(async () => {
      try {
        await updateDoc(doc(db, 'trips', selectedTrip.id), { packingList: newPacking });
      } catch (err) {
        console.error('Failed to save packing list', err);
      }
    }, 500);
  };

  const handleSaveEcoLog = async () => {
    if (!selectedTrip || !user || wasteKg === '' || wasteKg <= 0) return;
    setSavingEco(true);
    try {
      const tripRef = doc(db, 'trips', selectedTrip.id);
      await updateDoc(tripRef, {
        ecoLog: {
          wasteKg: Number(wasteKg),
          notes: ecoNotes,
          loggedAt: Timestamp.now()
        }
      });
      
      const pts = Number(wasteKg) * 10;
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { ecoScore: increment(pts) });
      await checkAndAwardAchievements(user.uid);
      
      toast.success(`Eco log tersimpan! +${pts} poin`);
    } catch (err) {
      toast.error('Gagal menyimpan eco log');
    } finally {
      setSavingEco(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'planned') return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Direncanakan</span>;
    if (status === 'ongoing') return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Berlangsung</span>;
    if (status === 'completed') return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Selesai</span>;
    return null;
  };

  let totalEssential = 0;
  let checkedEssential = 0;
  const hasPackingList = selectedTrip?.packingList && selectedTrip.packingList.length > 0;

  if (hasPackingList) {
    selectedTrip.packingList.forEach(cat => {
      cat.items.forEach(item => {
        if (item.isEssential) {
          totalEssential++;
          if (item.checked) checkedEssential++;
        }
      });
    });
  }

  const isPackingReady = hasPackingList && checkedEssential === totalEssential && totalEssential > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 md:pb-8 flex relative h-full">
      
      {/* Main List Column */}
      <div className={`w-full transition-all duration-300 ${selectedTrip ? 'hidden md:block md:w-1/2 lg:w-5/12 pr-0 md:pr-4' : 'w-full'}`}>
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Trip Saya</h1>
            
            <div className="flex gap-2">
              <select 
                value={filter} 
                onChange={e => setFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
              >
                <option value="all">Semua</option>
                <option value="planned">Direncanakan</option>
                <option value="ongoing">Berlangsung</option>
                <option value="completed">Selesai</option>
              </select>
              
              <select 
                value={sortOrder} 
                onChange={e => setSortOrder(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 rounded-2xl bg-stone-100 dark:bg-stone-800 animate-pulse"></div>
              ))}
            </div>
          ) : filteredTrips.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredTrips.map(trip => (
                <button
                  key={trip.id}
                  onClick={() => setSelectedTrip(trip)}
                  className={`text-left p-4 rounded-2xl border transition-all duration-200 flex gap-4 ${
                    selectedTrip?.id === trip.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-500/50'
                      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-emerald-400 to-stone-600 dark:from-emerald-700 dark:to-stone-800 shrink-0 overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center text-white/30">
                      <MapPin className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-stone-900 dark:text-stone-100 truncate">{trip.title || trip.mountainName}</h3>
                        {getStatusBadge(trip.status)}
                      </div>
                      <div className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-1 mb-2">
                        <Calendar className="w-4 h-4" /> {formatDate(trip.startDate)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-600 dark:text-stone-300">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {trip.duration} Hari</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3"/> {trip.members} Org</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700">
              <Map className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">Belum ada trip</h3>
              <p className="text-stone-500 dark:text-stone-400 mb-6 text-sm max-w-xs mx-auto">Anda belum memiliki rencana pendakian yang sesuai dengan filter ini.</p>
              <Link href="/user/planner" className="inline-flex items-center px-6 py-3 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors">
                Rencanakan Trip Pertama
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* FAB (Mobile only) */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <Link href="/user/planner" className="w-14 h-14 rounded-full bg-emerald-600 text-white shadow-lg flex items-center justify-center hover:bg-emerald-700 transition-colors">
          <Plus className="w-6 h-6" />
        </Link>
      </div>

      {/* Detail Column */}
      {selectedTrip && (
        <div className={`fixed inset-0 z-50 bg-white dark:bg-stone-950 md:static md:bg-transparent md:z-0 transition-all duration-300 md:block md:w-1/2 lg:w-7/12 flex flex-col ${selectedTrip ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
          <div className="flex-1 md:rounded-3xl md:border md:border-stone-200 md:dark:border-stone-700 bg-white dark:bg-stone-900 overflow-hidden flex flex-col shadow-2xl md:shadow-none h-full">
            
            {/* Header Detail */}
            <div className="p-4 md:p-6 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50 flex items-start justify-between shrink-0 pt-10 md:pt-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100">{selectedTrip.title ? `${selectedTrip.title} (${selectedTrip.mountainName})` : selectedTrip.mountainName}</h2>
                <p className="text-sm text-stone-500 dark:text-stone-400">{formatDate(selectedTrip.startDate)} • {selectedTrip.duration} Hari</p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  {getStatusBadge(selectedTrip.status)}
                  {selectedTrip.status === 'planned' && (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isPackingReady ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      Wajib: {checkedEssential}/{totalEssential} Terpenuhi
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedTrip(null)} className="p-2 md:hidden rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shrink-0">
              <button 
                onClick={() => setActiveTab('itinerary')}
                className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'itinerary' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
              >
                Itinerary
              </button>
              <button 
                onClick={() => setActiveTab('packing')}
                className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'packing' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
              >
                Packing List
              </button>
              {selectedTrip.status === 'completed' && (
                <button 
                  onClick={() => setActiveTab('eco')}
                  className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'eco' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
                >
                  Eco Log
                </button>
              )}
            </div>

            {/* Content Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-stone-50/50 dark:bg-stone-950/50">
              
              {activeTab === 'itinerary' && (
                <div className="space-y-6">
                  {selectedTrip.itinerary.map((day, idx) => (
                    <div key={idx} className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-4">
                      <h4 className="font-bold text-stone-900 dark:text-stone-100 mb-3 pb-2 border-b border-stone-100 dark:border-stone-700">Hari {day.day} - {day.title}</h4>
                      <div className="space-y-4">
                        {day.activities.map((act, i) => (
                          <div key={i} className="flex gap-3 text-sm">
                            <span className="font-medium text-emerald-600 dark:text-emerald-400 w-12 shrink-0">{act.time}</span>
                            <div>
                              <p className="font-medium text-stone-900 dark:text-stone-100">{act.activity}</p>
                              {act.notes && <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{act.notes}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'packing' && (
                <div className="space-y-4">
                  {!selectedTrip.packingList || selectedTrip.packingList.length === 0 ? (
                    <div className="text-center py-12">
                      <Backpack className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
                      <p className="text-stone-500 dark:text-stone-400 mb-4">Packing list belum dibuat.</p>
                      <Link href="/user/packing-list" className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-700">
                        Buat Packing List
                      </Link>
                    </div>
                  ) : (
                    <>
                      {/* Progress */}
                      <div className="bg-white dark:bg-stone-800 p-4 rounded-xl border border-stone-200 dark:border-stone-700 mb-6">
                        <div className="flex justify-between text-sm font-medium mb-2">
                          <span className="text-stone-900 dark:text-stone-100">Progress</span>
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {selectedTrip.packingList.reduce((acc, cat) => acc + cat.items.filter(i=>i.checked).length, 0)}/
                            {selectedTrip.packingList.reduce((acc, cat) => acc + cat.items.length, 0)} item
                          </span>
                        </div>
                        <div className="h-2 w-full bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 transition-all"
                            style={{ width: `${(selectedTrip.packingList.reduce((acc, cat) => acc + cat.items.filter(i=>i.checked).length, 0) / selectedTrip.packingList.reduce((acc, cat) => acc + cat.items.length, 0)) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Items */}
                      {selectedTrip.packingList.map((cat, cIdx) => (
                        <div key={cat.category} className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                          <div className="bg-stone-50 dark:bg-stone-900/50 p-3 font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2 text-sm border-b border-stone-200 dark:border-stone-700">
                            <span>{cat.icon}</span> {cat.category}
                          </div>
                          <div className="p-2">
                            {cat.items.map((item, iIdx) => (
                              <label key={item.id} className="flex items-center justify-between p-2 hover:bg-stone-50 dark:hover:bg-stone-700/30 rounded-lg cursor-pointer">
                                <div className="flex items-center gap-3">
                                  <input 
                                    type="checkbox" 
                                    checked={item.checked} 
                                    onChange={() => handlePackingToggle(cIdx, iIdx)}
                                    className="w-4 h-4 text-emerald-500 rounded border-stone-300 dark:border-stone-600"
                                  />
                                  <span className={`text-sm ${item.checked ? 'text-stone-400 line-through' : 'text-stone-700 dark:text-stone-300'}`}>{item.name}</span>
                                </div>
                                <span className="text-xs text-stone-500 dark:text-stone-400">{item.quantity} {item.unit}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'eco' && selectedTrip.status === 'completed' && (
                <div className="space-y-6">
                  {selectedTrip.ecoLog?.wasteKg > 0 ? (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-6 text-center">
                      <Leaf className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                      <h3 className="font-bold text-emerald-900 dark:text-emerald-100 text-lg mb-1">Eco Log Tersimpan</h3>
                      <p className="text-emerald-700 dark:text-emerald-400 text-sm mb-4">Anda telah mengumpulkan {selectedTrip.ecoLog.wasteKg} kg sampah di pendakian ini.</p>
                      {selectedTrip.ecoLog.notes && (
                        <div className="bg-white/60 dark:bg-stone-900/60 p-4 rounded-xl text-left text-sm text-stone-700 dark:text-stone-300">
                          "{selectedTrip.ecoLog.notes}"
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 space-y-4">
                      <div className="text-center mb-6">
                        <Leaf className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                        <h3 className="font-bold text-stone-900 dark:text-stone-100">Catat Eco Log</h3>
                        <p className="text-sm text-stone-500 dark:text-stone-400">Berkontribusi menjaga alam. Berapa kilogram sampah yang Anda bawa turun?</p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">Berat Sampah (kg)</label>
                        <input 
                          type="number" 
                          step="0.1" 
                          min="0"
                          value={wasteKg} 
                          onChange={e => setWasteKg(e.target.value ? Number(e.target.value) : '')}
                          placeholder="Misal: 1.5"
                          className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">Catatan (Opsional)</label>
                        <textarea 
                          rows={3}
                          value={ecoNotes} 
                          onChange={e => setEcoNotes(e.target.value)}
                          placeholder="Ceritakan kondisi sampah di jalur..."
                          className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none"
                        />
                      </div>

                      <button 
                        onClick={handleSaveEcoLog}
                        disabled={savingEco || !wasteKg || wasteKg <= 0}
                        className="w-full py-3 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-bold hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                      >
                        {savingEco ? 'Menyimpan...' : 'Simpan Eco Log'}
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Footer Action */}
            <div className="p-4 md:p-6 border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shrink-0">
              {selectedTrip.status === 'planned' && (
                <div className="space-y-3">
                  {!isPackingReady && (
                    <p className="text-xs text-red-500 dark:text-red-400 text-center font-medium">
                      {!hasPackingList 
                        ? 'Buat packing list terlebih dahulu sebelum memulai pendakian.'
                        : 'Selesaikan semua item wajib di packing list sebelum memulai pendakian.'}
                    </p>
                  )}
                  <button 
                    onClick={() => handleStatusChange('ongoing')}
                    disabled={!isPackingReady}
                    className="w-full py-4 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 disabled:bg-stone-300 dark:disabled:bg-stone-700 disabled:text-stone-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" /> Mulai Pendakian
                  </button>
                </div>
              )}
              {selectedTrip.status === 'ongoing' && (
                <button 
                  onClick={() => handleStatusChange('completed')}
                  className="w-full py-4 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-bold hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Check className="w-5 h-5" /> Selesaikan Pendakian
                </button>
              )}
              {selectedTrip.status === 'completed' && (
                <div className="text-center text-sm font-medium text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 py-3 rounded-xl">
                  Pendakian Selesai
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
