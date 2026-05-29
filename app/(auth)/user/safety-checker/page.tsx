'use client';

import React, { useState } from 'react';
import { checkSafety, SafetyInput } from '@/lib/safety-checker';
import { SafetyResult } from '@/types';
import { ShieldAlert, RefreshCw, CheckCircle, AlertTriangle, XCircle, Info, ChevronRight, Activity, Thermometer, Users, Mountain, ShieldCheck } from 'lucide-react';

export default function SafetyCheckerPage() {
  const [result, setResult] = useState<SafetyResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [physicalCondition, setPhysicalCondition] = useState<'poor' | 'average' | 'good' | 'excellent'>('average');
  const [hasMedicalCondition, setHasMedicalCondition] = useState(false);

  const [mountainDifficulty, setMountainDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('medium');
  const [groupSize, setGroupSize] = useState(2);
  const [hasGuide, setHasGuide] = useState(false);
  const [durationDays, setDurationDays] = useState(2);

  const [plannedSeason, setPlannedSeason] = useState<'dry' | 'wet'>('dry');
  const [weatherCondition, setWeatherCondition] = useState<'clear' | 'cloudy' | 'rainy' | 'stormy'>('clear');

  const handleCheck = () => {
    setLoading(true);
    setTimeout(() => {
      const input: SafetyInput = {
        experienceLevel,
        physicalCondition,
        hasMedicalCondition,
        mountainDifficulty,
        groupSize,
        hasGuide,
        durationDays,
        plannedSeason,
        weatherCondition
      };
      setResult(checkSafety(input));
      setLoading(false);
    }, 800); // Simulate processing time for UX
  };

  const handleReset = () => {
    setResult(null);
  };

  const circumference = 2 * Math.PI * 40; // r=40
  const offset = result ? circumference - (result.score / 100) * circumference : circumference;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-emerald-600 dark:text-emerald-500" /> Cek Keamanan Pendakian
        </h1>
        <p className="text-stone-500 dark:text-stone-400">Evaluasi seberapa aman rencana pendakian Anda berdasarkan kondisi saat ini.</p>
      </div>

      {!result && !loading && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Section 1: Profil Kamu */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">1</div>
                <h2 className="font-bold text-stone-900 dark:text-stone-100">Profil Kamu</h2>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">Level Pengalaman</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'beginner', label: 'Pemula', icon: '🥾' },
                    { id: 'intermediate', label: 'Menengah', icon: '🏃' },
                    { id: 'advanced', label: 'Mahir', icon: '🧗' }
                  ].map(level => (
                    <button
                      key={level.id}
                      onClick={() => setExperienceLevel(level.id as any)}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                        experienceLevel === level.id
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500'
                          : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:border-emerald-300 dark:hover:border-emerald-700'
                      }`}
                    >
                      <span className="text-xl">{level.icon}</span> <span className="font-medium text-sm">{level.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">Kondisi Fisik</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'poor', label: 'Kurang Bugar', icon: '😴' },
                    { id: 'average', label: 'Cukup', icon: '😐' },
                    { id: 'good', label: 'Bugar', icon: '💪' },
                    { id: 'excellent', label: 'Sangat Bugar', icon: '🏋️' }
                  ].map(cond => (
                    <button
                      key={cond.id}
                      onClick={() => setPhysicalCondition(cond.id as any)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                        physicalCondition === cond.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 ring-1 ring-blue-500'
                          : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                    >
                      <span className="text-lg">{cond.icon}</span> <span className="font-medium text-[11px]">{cond.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input 
                      type="checkbox"
                      checked={hasMedicalCondition}
                      onChange={(e) => setHasMedicalCondition(e.target.checked)}
                      className="peer appearance-none w-5 h-5 border-2 border-stone-300 dark:border-stone-600 rounded checked:bg-emerald-500 checked:border-emerald-500 transition-all"
                    />
                    <CheckCircle className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-stone-900 dark:text-stone-100">Ada kondisi medis khusus (jantung, asma, dll)</span>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center"><Info className="w-3 h-3 mr-1"/> Info ini tidak disimpan ke server</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Section 2: Rencana Pendakian */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">2</div>
                <h2 className="font-bold text-stone-900 dark:text-stone-100">Rencana Pendakian</h2>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">Tingkat Kesulitan Gunung</label>
                <select 
                  value={mountainDifficulty} 
                  onChange={e => setMountainDifficulty(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none appearance-none"
                >
                  <option value="easy">Mudah</option>
                  <option value="medium">Sedang</option>
                  <option value="hard">Sulit</option>
                  <option value="expert">Ekstrem</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">Jumlah Anggota</label>
                <input 
                  type="number" min="1" max="50"
                  value={groupSize} 
                  onChange={e => setGroupSize(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">Durasi (Hari)</label>
                <input 
                  type="number" min="1" max="30"
                  value={durationDays} 
                  onChange={e => setDurationDays(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-stone-900 dark:text-stone-100">Pakai Guide Lokal</span>
                  <div className="relative">
                    <input type="checkbox" className="sr-only peer" checked={hasGuide} onChange={e => setHasGuide(e.target.checked)} />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </div>
                </label>
              </div>
            </div>

            {/* Section 3: Kondisi Cuaca */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">3</div>
                <h2 className="font-bold text-stone-900 dark:text-stone-100">Kondisi Cuaca</h2>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">Musim</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setPlannedSeason('dry')} className={`p-2 rounded-xl border text-sm font-medium transition-all ${plannedSeason === 'dry' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400'}`}>☀️ Kemarau</button>
                  <button onClick={() => setPlannedSeason('wet')} className={`p-2 rounded-xl border text-sm font-medium transition-all ${plannedSeason === 'wet' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400'}`}>🌧️ Hujan</button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">Prakiraan Cuaca</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'clear', label: 'Cerah', icon: '☀️' },
                    { id: 'cloudy', label: 'Berawan', icon: '⛅' },
                    { id: 'rainy', label: 'Hujan', icon: '🌧️' },
                    { id: 'stormy', label: 'Badai', icon: '⛈️' }
                  ].map(w => (
                    <button
                      key={w.id}
                      onClick={() => setWeatherCondition(w.id as any)}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                        weatherCondition === w.id
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-500'
                          : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:border-indigo-300 dark:hover:border-indigo-700'
                      }`}
                    >
                      <span className="text-xl">{w.icon}</span> <span className="font-medium text-sm">{w.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          <button 
            onClick={handleCheck}
            className="w-full py-4 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
          >
            Cek Sekarang
          </button>
        </div>
      )}

      {loading && (
        <div className="h-64 flex flex-col items-center justify-center space-y-4 animate-in fade-in">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 border-4 border-emerald-100 dark:border-emerald-900/50 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-stone-500 dark:text-stone-400 font-medium">Menganalisis kondisi keamanan...</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
          
          {/* Status Banner */}
          <div className={`p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 justify-between text-white shadow-xl ${
            result.status === 'GO' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
            result.status === 'CAUTION' ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
            'bg-gradient-to-r from-red-500 to-red-600'
          }`}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                {result.status === 'GO' ? <CheckCircle className="w-8 h-8" /> : 
                 result.status === 'CAUTION' ? <AlertTriangle className="w-8 h-8" /> : 
                 <XCircle className="w-8 h-8" />}
              </div>
              <div>
                <p className="text-white/80 font-medium uppercase tracking-wider text-sm mb-1">Status Keamanan</p>
                <h2 className="text-2xl font-bold">
                  {result.status === 'GO' ? 'AMAN UNTUK MENDAKI' : 
                   result.status === 'CAUTION' ? 'PERHATIKAN KONDISI INI' : 
                   'TIDAK DISARANKAN MENDAKI'}
                </h2>
              </div>
            </div>

            {/* Score Gauge */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/20" />
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="text-white drop-shadow-md transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{result.score}</span>
                <span className="text-[9px] uppercase tracking-wider font-semibold opacity-80">Skor</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Rekomendasi (Always shown) */}
            <div className={`p-6 rounded-2xl border ${result.status === 'GO' ? 'md:col-span-3 border-emerald-200 bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-900/20' : 'border-emerald-200 bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-900/10'}`}>
              <div className="flex items-center gap-2 mb-4 text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-bold text-lg">Rekomendasi</h3>
              </div>
              <ul className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-3 text-emerald-900 dark:text-emerald-100 text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
                {result.recommendations.length === 0 && (
                  <li className="text-sm text-emerald-700/70 dark:text-emerald-400/70 italic">Tidak ada rekomendasi khusus.</li>
                )}
              </ul>
            </div>

            {/* Peringatan */}
            {(result.status === 'CAUTION' || result.status === 'NO-GO') && (
              <div className="p-6 rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/10 h-full">
                <div className="flex items-center gap-2 mb-4 text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-bold text-lg">Peringatan</h3>
                </div>
                <ul className="space-y-3">
                  {result.warnings.map((warn, i) => (
                    <li key={i} className="flex gap-3 text-amber-900 dark:text-amber-100 text-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{warn}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Yang Perlu Ditingkatkan */}
            {result.status === 'NO-GO' && (
              <div className="p-6 rounded-2xl border border-blue-200 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/10 h-full">
                <div className="flex items-center gap-2 mb-4 text-blue-800 dark:text-blue-300">
                  <Activity className="w-5 h-5" />
                  <h3 className="font-bold text-lg">Tindakan Perbaikan</h3>
                </div>
                <ul className="space-y-3">
                  {result.improvements.map((imp, i) => (
                    <li key={i} className="flex gap-3 text-blue-900 dark:text-blue-100 text-sm">
                      <ChevronRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-center">
            <button
              onClick={handleReset}
              className="flex items-center px-6 py-3 rounded-xl border-2 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Cek Ulang Kondisi
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
