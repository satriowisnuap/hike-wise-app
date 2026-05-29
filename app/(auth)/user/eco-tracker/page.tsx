'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot, orderBy, limit, Timestamp } from 'firebase/firestore';
import { Trip, User } from '@/types';
import Avatar from '@/components/Avatar';
import { Leaf, Medal, Info, Wind, Trash2, Mountain, Flame, Droplets, MapPin, Search } from 'lucide-react';

export default function EcoTrackerPage() {
  const { currentUser: user, userProfile: dbUser } = useAuth();

  const [ecoHistory, setEcoHistory] = useState<Trip[]>([]);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [leaderboardTab, setLeaderboardTab] = useState<'weekly' | 'monthly' | 'all'>('all');
  const [totalWaste, setTotalWaste] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      try {
        const q = query(collection(db, 'trips'), where('userId', '==', user.uid), where('status', '==', 'completed'));
        const snapshot = await getDocs(q);
        const trips = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Trip));
        
        const ecoTrips = trips.filter(t => t.ecoLog && t.ecoLog.wasteKg > 0)
          .sort((a, b) => (b.ecoLog.loggedAt?.toMillis() || 0) - (a.ecoLog.loggedAt?.toMillis() || 0));
        
        setEcoHistory(ecoTrips);
        setTotalWaste(ecoTrips.reduce((acc, t) => acc + (t.ecoLog?.wasteKg || 0), 0));
      } catch (err) {
        console.error('Failed to fetch eco history', err);
      }
    };
    fetchHistory();
  }, [user]);

  useEffect(() => {
    // For simplicity, all tabs query by ecoScore desc as per prompt instruction
    const q = query(collection(db, 'users'), orderBy('ecoScore', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const topUsers = snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as User));
      setLeaderboard(topUsers);
    });
    return () => unsubscribe();
  }, [leaderboardTab]);

  const getEcoLevel = (score: number) => {
    if (score < 25) return { name: '🌱 Benih', next: 25, color: 'bg-emerald-500' };
    if (score < 50) return { name: '🌿 Tunas', next: 50, color: 'bg-green-500' };
    if (score < 100) return { name: '🌳 Pohon', next: 100, color: 'bg-teal-500' };
    return { name: '🌲 Penjaga Hutan', next: score, color: 'bg-emerald-700' }; // max level
  };

  const currentScore = dbUser?.ecoScore || 0;
  const level = getEcoLevel(currentScore);
  const progress = level.next > currentScore ? (currentScore / level.next) * 100 : 100;
  const completedTrips = dbUser?.totalTrips || 0;
  const co2Offset = completedTrips * 2.5;

  const formatDate = (ts?: Timestamp | null) => {
    if (!ts) return '';
    return ts.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 md:pb-8">
      
      {/* ECO SCORE HERO CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white p-8 shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Leaf className="w-48 h-48" />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-semibold mb-6">
              Level: {level.name}
            </div>
            <p className="text-emerald-100 font-medium mb-1">Total Eco Score</p>
            <div className="flex items-baseline gap-2 mb-6">
              <h1 className="text-6xl md:text-7xl font-black">{currentScore}</h1>
              <span className="text-xl text-emerald-200 font-bold">pts</span>
            </div>
            
            <div className="space-y-2 max-w-sm">
              <div className="flex justify-between text-sm text-emerald-100 font-medium">
                <span>Progress</span>
                {level.next > currentScore ? (
                  <span>{currentScore} / {level.next} pts</span>
                ) : (
                  <span>Level Maksimal</span>
                )}
              </div>
              <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-1000 ease-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              {level.next > currentScore && (
                <p className="text-xs text-emerald-200">Kumpulkan {level.next - currentScore} pts lagi untuk naik level!</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
              <Trash2 className="w-6 h-6 text-emerald-200 mb-2" />
              <p className="text-xs text-emerald-100 font-medium">Total Sampah</p>
              <p className="text-xl font-bold">{totalWaste.toFixed(1)} <span className="text-sm font-normal">kg</span></p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
              <Mountain className="w-6 h-6 text-emerald-200 mb-2" />
              <p className="text-xs text-emerald-100 font-medium">Trip Selesai</p>
              <p className="text-xl font-bold">{completedTrips}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
              <Wind className="w-6 h-6 text-emerald-200 mb-2" />
              <p className="text-xs text-emerald-100 font-medium">CO2 Offset</p>
              <p className="text-xl font-bold">{co2Offset.toFixed(1)} <span className="text-sm font-normal">kg</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 space-y-8">
          {/* MY ECO HISTORY */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Riwayat Eco Log</h2>
            </div>
            
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden shadow-sm">
              {ecoHistory.length > 0 ? (
                <div className="divide-y divide-stone-100 dark:divide-stone-800">
                  {ecoHistory.map(trip => (
                    <div key={trip.id} className="p-4 sm:p-6 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                          <h3 className="font-bold text-stone-900 dark:text-stone-100">{trip.mountainName}</h3>
                          <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                            {formatDate(trip.ecoLog?.loggedAt)}
                          </div>
                          {trip.ecoLog?.notes && (
                            <p className="text-sm text-stone-600 dark:text-stone-300 mt-2 italic line-clamp-2">
                              "{trip.ecoLog.notes}"
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Sampah</p>
                            <p className="font-bold text-stone-900 dark:text-stone-100">{trip.ecoLog?.wasteKg} kg</p>
                          </div>
                          <div className="w-px h-8 bg-stone-200 dark:bg-stone-700"></div>
                          <div className="text-right">
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Poin</p>
                            <p className="font-bold text-emerald-600 dark:text-emerald-400">+{((trip.ecoLog?.wasteKg || 0) * 10).toFixed(0)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-stone-500 dark:text-stone-400">
                  <Leaf className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Belum ada eco log. Selesaikan trip dan isi eco log untuk mendapatkan poin!</p>
                </div>
              )}
            </div>
          </div>

          {/* ECO TIPS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Tips Pendaki Bijak</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: <Trash2/>, text: 'Prinsip Leave No Trace, bawa turun sampahmu.' },
                { icon: <Droplets/>, text: 'Gunakan botol minum isi ulang, kurangi plastik.' },
                { icon: <Flame/>, text: 'Jangan buat api unggun sembarangan, hindari karhutla.' },
                { icon: <Leaf/>, text: 'Jangan petik flora dan tangkap fauna endemik.' },
                { icon: <MapPin/>, text: 'Laporkan kondisi jalur ke komunitas TrailMind.' }
              ].map((tip, i) => (
                <div key={i} className="p-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 flex items-start gap-3">
                  <div className="text-emerald-500 shrink-0 mt-0.5">{tip.icon}</div>
                  <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COMMUNITY LEADERBOARD */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2">
            <Medal className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Top Eco Warrior</h2>
          </div>
          
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden shadow-sm flex flex-col h-[600px]">
            <div className="flex border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50 shrink-0">
              {['weekly', 'monthly', 'all'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setLeaderboardTab(tab as any)}
                  className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                    leaderboardTab === tab ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                  }`}
                >
                  {tab === 'weekly' ? 'Mingguan' : tab === 'monthly' ? 'Bulanan' : 'Semua Waktu'}
                </button>
              ))}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {leaderboard.map((lbUser, idx) => {
                const isCurrentUser = lbUser.uid === user?.uid;
                let rankIcon = <span className="font-bold text-stone-400 dark:text-stone-500">{idx + 1}</span>;
                if (idx === 0) rankIcon = <span className="text-xl">🥇</span>;
                else if (idx === 1) rankIcon = <span className="text-xl">🥈</span>;
                else if (idx === 2) rankIcon = <span className="text-xl">🥉</span>;

                const lvl = getEcoLevel(lbUser.ecoScore || 0);

                return (
                  <div 
                    key={lbUser.uid} 
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      isCurrentUser 
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800' 
                        : 'hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <div className="w-6 text-center shrink-0">{rankIcon}</div>
                    <Avatar name={lbUser.name || 'User'} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-stone-900 dark:text-stone-100 truncate text-sm">
                        {lbUser.name} {isCurrentUser && <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400 ml-1">(Anda)</span>}
                      </p>
                      <p className="text-[10px] font-medium text-stone-500 dark:text-stone-400 truncate">
                        {lvl.name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">{lbUser.ecoScore || 0}</p>
                      <p className="text-[10px] text-stone-400 uppercase">pts</p>
                    </div>
                  </div>
                );
              })}
              {leaderboard.length === 0 && (
                <div className="text-center py-10 text-stone-500 dark:text-stone-400 text-sm">
                  Belum ada data leaderboard.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
