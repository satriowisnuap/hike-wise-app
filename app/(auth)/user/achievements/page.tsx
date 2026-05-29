'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { UserAchievement } from '@/types';
import { toast } from 'sonner';
import { Award, Lock, Star } from 'lucide-react';

const ACHIEVEMENTS = [
  {id:'first-step', name:'Langkah Pertama', icon:'🥾', category:'explorer', desc:'Selesaikan trip pertamamu', hint:'Selesaikan 1 trip'},
  {id:'mountain-hopper', name:'Mountain Hopper', icon:'🏔️', category:'explorer', desc:'Kunjungi 3 gunung berbeda', hint:'Selesaikan trip di 3 gunung berbeda'},
  {id:'peak-collector', name:'Kolektor Puncak', icon:'🗻', category:'explorer', desc:'Taklukkan 5 gunung berbeda', hint:'Selesaikan trip di 5 gunung berbeda'},
  {id:'eco-starter', name:'Eco Starter', icon:'🌱', category:'eco', desc:'Buat eco log pertamamu', hint:'Isi eco log di 1 trip selesai'},
  {id:'waste-warrior', name:'Waste Warrior', icon:'♻️', category:'eco', desc:'Kumpulkan 5kg sampah total', hint:'Total eco log mencapai 5 kg'},
  {id:'forest-guardian', name:'Penjaga Hutan', icon:'🌳', category:'eco', desc:'Raih eco score 100+', hint:'Eco score mencapai 100 poin'},
  {id:'team-player', name:'Tim Solid', icon:'👥', category:'explorer', desc:'Trip dengan 4+ anggota', hint:'Buat 1 trip minimal 4 orang'},
  {id:'prepared-hiker', name:'Pendaki Siap', icon:'🎒', category:'safety', desc:'Buat 3 packing list', hint:'Generate packing list untuk 3 trip'},
  {id:'safety-first', name:'Safety First', icon:'🛡️', category:'safety', desc:'Lakukan 5 safety check', hint:'Simpan safety check di 5 trip'},
  {id:'trail-reporter', name:'Reporter Jalur', icon:'📢', category:'community', desc:'Submit 3 laporan jalur', hint:'Kirim 3 laporan (disetujui)'},
  {id:'trusted-reporter', name:'Reporter Terpercaya', icon:'⭐', category:'community', desc:'Raih 5 laporan disetujui', hint:'5 laporanmu disetujui admin'},
  {id:'veteran-hiker', name:'Veteran Pendaki', icon:'🎯', category:'explorer', desc:'Selesaikan 10 trip', hint:'Selesaikan 10 trip pendakian'}
];

export default function AchievementsPage() {
  const { currentUser: user } = useAuth();
  
  const [earned, setEarned] = useState<Record<string, Timestamp>>({});
  const [filter, setFilter] = useState<'all' | 'explorer' | 'eco' | 'safety' | 'community'>('all');
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const fetchAchievements = async () => {
      try {
        const q = query(collection(db, 'userAchievements'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        
        const earnedMap: Record<string, Timestamp> = {};
        const earnedIds: string[] = [];
        
        snapshot.docs.forEach(doc => {
          const data = doc.data() as UserAchievement;
          earnedMap[data.achievementId] = data.earnedAt;
          earnedIds.push(data.achievementId);
        });
        
        setEarned(earnedMap);
        
        // Confetti Check
        const cachedString = sessionStorage.getItem('trailmind_achievements');
        const cachedIds = cachedString ? JSON.parse(cachedString) : [];
        
        const newIds = earnedIds.filter(id => !cachedIds.includes(id));
        if (newIds.length > 0) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
          
          newIds.forEach(id => {
            const ach = ACHIEVEMENTS.find(a => a.id === id);
            if (ach) {
              toast(`🎉 Badge baru diraih: ${ach.name}!`);
            }
          });
          
          sessionStorage.setItem('trailmind_achievements', JSON.stringify(earnedIds));
        }
        
      } catch (err) {
        console.error('Error fetching achievements', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAchievements();
  }, [user]);

  const earnedCount = Object.keys(earned).length;
  const totalCount = ACHIEVEMENTS.length;
  const progressPercent = (earnedCount / totalCount) * 100;

  const filteredAchievements = ACHIEVEMENTS.filter(a => filter === 'all' || a.category === filter);

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'explorer': return 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100';
      case 'eco': return 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100';
      case 'safety': return 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100';
      case 'community': return 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-100';
      default: return 'bg-stone-50 border-stone-200';
    }
  };

  const formatDate = (ts: Timestamp) => {
    return ts.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 md:pb-8 relative">
      
      {/* Confetti overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex items-start justify-center">
          <div className="confetti-container absolute inset-0">
            {Array.from({length: 50}).map((_, i) => (
              <div key={i} className={`confetti absolute w-3 h-3 rounded-sm opacity-80 ${['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500'][i%5]}`} 
                   style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`, animationDuration: `${2 + Math.random() * 3}s` }}>
              </div>
            ))}
          </div>
          <style dangerouslySetInnerHTML={{__html:`
            @keyframes fall {
              0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
            }
            .confetti { animation: fall linear forwards; }
          `}} />
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 md:p-8 border border-stone-200 dark:border-stone-700 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
          <Award className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">Pencapaianmu</h1>
          <p className="text-stone-600 dark:text-stone-400 mb-4 font-medium">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{earnedCount}</span> dari {totalCount} badge diraih
          </p>
          <div className="h-3 w-full max-w-md mx-auto md:mx-0 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-1000 ease-out relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 border-b border-stone-200 dark:border-stone-700 hide-scrollbar gap-2">
        {[
          { id: 'all', label: 'Semua' },
          { id: 'explorer', label: 'Explorer' },
          { id: 'eco', label: 'Eco' },
          { id: 'safety', label: 'Safety' },
          { id: 'community', label: 'Komunitas' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              filter === tab.id
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 rounded-2xl bg-stone-100 dark:bg-stone-800 animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredAchievements.map(ach => {
            const isEarned = !!earned[ach.id];
            
            if (isEarned) {
              return (
                <div key={ach.id} className={`relative p-5 rounded-2xl border flex flex-col justify-between overflow-hidden group hover:scale-[1.02] transition-transform ${getCategoryColor(ach.category)}`}>
                  <div className="absolute -right-4 -bottom-4 text-9xl opacity-[0.03] select-none pointer-events-none group-hover:scale-110 transition-transform duration-500">
                    {ach.icon}
                  </div>
                  <div>
                    <div className="text-3xl mb-3">{ach.icon}</div>
                    <h3 className="font-bold mb-1 leading-tight">{ach.name}</h3>
                    <p className="text-xs opacity-90 line-clamp-2">{ach.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10">
                    <p className="text-[10px] font-semibold uppercase tracking-wider opacity-75">
                      Diraih: {formatDate(earned[ach.id])}
                    </p>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={ach.id} className="relative p-5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 grayscale opacity-60 flex flex-col justify-between">
                  <div className="absolute top-4 right-4 text-stone-400 dark:text-stone-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-3xl mb-3">{ach.icon}</div>
                    <h3 className="font-bold mb-1 text-stone-500 dark:text-stone-400 leading-tight">{ach.name}</h3>
                  </div>
                  <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-700">
                    <p className="text-[10px] font-medium text-stone-500 dark:text-stone-400 italic">
                      {ach.hint}
                    </p>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
