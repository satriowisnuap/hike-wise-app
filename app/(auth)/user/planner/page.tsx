'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, addDoc, Timestamp } from 'firebase/firestore';
import { Mountain, Trip, ItineraryDay } from '@/types';
import { generateItinerary, PlannerInput } from '@/lib/trail-planner';
import { checkAndAwardAchievements } from '@/lib/achievement-checker';
import { toast } from 'sonner';
import { MapPin, Calendar, Users, Award, ChevronLeft, ChevronRight, CheckCircle2, Navigation2, Search, ArrowRight, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PlannerPage() {
  const { currentUser: user } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [mountains, setMountains] = useState<Mountain[]>([]);
  const [filteredMountains, setFilteredMountains] = useState<Mountain[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedMountain, setSelectedMountain] = useState<Mountain | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [duration, setDuration] = useState<number>(2);
  const [members, setMembers] = useState<number>(2);
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Set default start date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setStartDate(tomorrow.toISOString().split('T')[0]);

    const fetchMountains = async () => {
      try {
        const q = query(collection(db, 'mountains'), where('isOpen', '==', true));
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mountain));
        setMountains(fetched);
        setFilteredMountains(fetched);
      } catch (err) {
        console.error('Error fetching mountains:', err);
        toast.error('Gagal memuat daftar gunung');
      } finally {
        setLoading(false);
      }
    };
    fetchMountains();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMountains(mountains);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredMountains(mountains.filter(m => m.name.toLowerCase().includes(lowerQuery) || m.province.toLowerCase().includes(lowerQuery)));
    }
  }, [searchQuery, mountains]);

  const handleNextToStep3 = () => {
    if (!selectedMountain) return;
    const input: PlannerInput = {
      mountainName: selectedMountain.name,
      mountainDifficulty: selectedMountain.difficulty,
      duration,
      members,
      experienceLevel
    };
    const generated = generateItinerary(input);
    setItinerary(generated);
    setStep(3);
  };

  const handleSaveTrip = async () => {
    if (!user || !selectedMountain || !startDate) return;
    
    setSaving(true);
    try {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + duration - 1);

      const tripData: Omit<Trip, 'id'> = {
        userId: user.uid,
        mountainId: selectedMountain.id,
        mountainName: selectedMountain.name,
        startDate: Timestamp.fromDate(start),
        endDate: Timestamp.fromDate(end),
        duration,
        members,
        experienceLevel,
        status: 'planned',
        itinerary,
        packingList: [],
        safetyResult: null,
        ecoLog: { wasteKg: 0, notes: '', loggedAt: null },
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'trips'), tripData);
      await checkAndAwardAchievements(user.uid);
      
      setStep(4);
      toast.success('Trip berhasil disimpan!');
    } catch (err) {
      console.error('Error saving trip:', err);
      toast.error('Gagal menyimpan trip');
    } finally {
      setSaving(false);
    }
  };

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case 'easy': return 'Mudah';
      case 'medium': return 'Sedang';
      case 'hard': return 'Sulit';
      case 'expert': return 'Ekstrem';
      default: return diff;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'medium': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'hard': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'expert': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 md:pb-8">
      {/* Header & Progress */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Perencanaan Trip</h1>
        <div className="relative pt-4">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-stone-200 dark:bg-stone-700">
            <div style={{ width: `${(step / 4) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-500"></div>
          </div>
          <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400 font-medium">
            <span className={step >= 1 ? 'text-emerald-600 dark:text-emerald-400' : ''}>Pilih Gunung</span>
            <span className={step >= 2 ? 'text-emerald-600 dark:text-emerald-400' : ''}>Detail</span>
            <span className={step >= 3 ? 'text-emerald-600 dark:text-emerald-400' : ''}>Itinerary</span>
            <span className={step >= 4 ? 'text-emerald-600 dark:text-emerald-400' : ''}>Selesai</span>
          </div>
        </div>
      </div>

      {/* Step 1: Pilih Gunung */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input 
              type="text" 
              placeholder="Cari gunung atau provinsi..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent outline-none transition-all"
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="rounded-2xl border border-stone-200 dark:border-stone-700 h-64 bg-stone-100 dark:bg-stone-800 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredMountains.map(mountain => (
                <button
                  key={mountain.id}
                  onClick={() => setSelectedMountain(mountain)}
                  className={`relative text-left rounded-2xl border overflow-hidden transition-all duration-200 ${
                    selectedMountain?.id === mountain.id 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 dark:ring-emerald-400/20' 
                      : 'border-stone-200 dark:border-stone-700 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white dark:bg-stone-900'
                  }`}
                >
                  <div className="aspect-[4/3] w-full relative">
                    {mountain.imageURL ? (
                      <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${mountain.imageURL})` }} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-stone-600 dark:from-emerald-700 dark:to-stone-800" />
                    )}
                    {selectedMountain?.id === mountain.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-stone-900 dark:text-stone-100 truncate">{mountain.name}</h3>
                    <div className="flex items-center text-xs text-stone-500 dark:text-stone-400">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate">{mountain.province}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-medium text-stone-700 dark:text-stone-300">{mountain.altitude} mdpl</span>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${getDifficultyColor(mountain.difficulty)}`}>
                        {getDifficultyLabel(mountain.difficulty)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
              
              {filteredMountains.length === 0 && (
                <div className="col-span-full py-12 text-center text-stone-500 dark:text-stone-400">
                  <MapPin className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Tidak ada gunung yang cocok dengan pencarian.</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedMountain}
              className="flex items-center px-6 py-3 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Lanjut <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Detail Perjalanan */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 space-y-8">
            
            {/* Start Date */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">
                Tanggal Keberangkatan
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input 
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Durasi Perjalanan
                </label>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full text-sm">
                  {duration} Hari {duration > 1 ? duration - 1 : 0} Malam
                </span>
              </div>
              <input 
                type="range"
                min="1"
                max="7"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
                <span>1 Hari (Tek-tok)</span>
                <span>7 Hari</span>
              </div>
            </div>

            {/* Members */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">
                Jumlah Anggota (termasuk Anda)
              </label>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setMembers(Math.max(1, members - 1))}
                  className="w-12 h-12 rounded-xl flex items-center justify-center border border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  -
                </button>
                <div className="w-20 text-center text-xl font-bold text-stone-900 dark:text-stone-100">
                  {members}
                </div>
                <button 
                  onClick={() => setMembers(Math.min(20, members + 1))}
                  className="w-12 h-12 rounded-xl flex items-center justify-center border border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  +
                </button>
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">
                Rata-rata Level Pengalaman Tim
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: 'beginner', label: 'Pemula', icon: '🥾' },
                  { id: 'intermediate', label: 'Menengah', icon: '🏃' },
                  { id: 'advanced', label: 'Mahir', icon: '🧗' }
                ].map(level => (
                  <button
                    key={level.id}
                    onClick={() => setExperienceLevel(level.id as any)}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                      experienceLevel === level.id
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500'
                        : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:border-emerald-300 dark:hover:border-emerald-700'
                    }`}
                  >
                    <span className="text-2xl">{level.icon}</span>
                    <span className="font-medium text-sm">{level.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="flex items-center px-6 py-3 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 font-medium hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Kembali
            </button>
            <button
              onClick={handleNextToStep3}
              disabled={!startDate}
              className="flex items-center px-6 py-3 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Buat Itinerary <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Itinerary */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 mb-1">
                Trip ke {selectedMountain?.name}
              </h2>
              <div className="flex flex-wrap gap-4 text-sm text-emerald-700 dark:text-emerald-300">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {startDate}</span>
                <span className="flex items-center gap-1"><Navigation2 className="w-4 h-4" /> {duration} Hari</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {members} Orang</span>
                <span className="flex items-center gap-1"><Award className="w-4 h-4" /> {experienceLevel === 'beginner' ? 'Pemula' : experienceLevel === 'intermediate' ? 'Menengah' : 'Mahir'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            <div className="border-b border-stone-200 dark:border-stone-700 p-4 bg-stone-50 dark:bg-stone-900/50 overflow-x-auto">
              <div className="flex space-x-2">
                {itinerary.map((dayData, idx) => (
                  <div key={idx} className="px-4 py-2 rounded-lg bg-white dark:bg-stone-800 shadow-sm border border-stone-200 dark:border-stone-700 whitespace-nowrap min-w-max">
                    <span className="font-bold text-stone-900 dark:text-stone-100 block text-sm">Hari {dayData.day}</span>
                    <span className="text-xs text-stone-500 dark:text-stone-400">{dayData.title}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 space-y-8">
              {itinerary.map((dayData, idx) => (
                <div key={idx} className="space-y-4">
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-2">
                    Hari {dayData.day} - {dayData.title}
                  </h3>
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-200 dark:before:via-stone-700 before:to-transparent">
                    {dayData.activities.map((act, actIdx) => (
                      <div key={actIdx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Timeline dot */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-stone-900 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          <span className="text-lg">{act.icon}</span>
                        </div>
                        {/* Content */}
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                              {act.time}
                            </span>
                            <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                              • {Math.floor(act.durationMinutes / 60)}j {act.durationMinutes % 60}m
                            </span>
                          </div>
                          <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-1">{act.activity}</h4>
                          {act.notes && (
                            <p className="text-xs text-stone-500 dark:text-stone-400">{act.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              disabled={saving}
              className="flex items-center px-6 py-3 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 font-medium hover:bg-stone-300 dark:hover:bg-stone-600 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Ubah Detail
            </button>
            <button
              onClick={handleSaveTrip}
              disabled={saving}
              className="flex items-center px-6 py-3 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Menyimpan...' : 'Simpan Trip'} <Save className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Sukses */}
      {step === 4 && (
        <div className="space-y-6 animate-in zoom-in-95 duration-500 text-center pt-8">
          <div className="w-32 h-32 mx-auto relative mb-6">
            <div className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/30 rounded-full animate-ping opacity-75"></div>
            <div className="relative w-full h-full bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
              <CheckCircle2 className="w-16 h-16" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100">Trip Berhasil Disimpan!</h2>
          <p className="text-stone-500 dark:text-stone-400 max-w-md mx-auto">
            Itinerary pendakian ke {selectedMountain?.name} telah tersimpan di daftar trip Anda. Langkah selanjutnya, siapkan barang bawaan Anda.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link 
              href="/user/packing-list"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors"
            >
              Buat Packing List
            </Link>
            <Link 
              href="/user/my-trips"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 font-medium hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
            >
              Lihat My Trips
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
