'use client';

import { useState } from 'react';
import { checkSafety, SafetyInput } from '@/lib/safety-checker';
import { SafetyResult } from '@/types';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function SafetyCheckerPage() {
  const [input, setInput] = useState<SafetyInput>({
    experienceLevel: 'intermediate',
    physicalCondition: 'good',
    plannedSeason: 'dry',
    weatherCondition: 'clear',
    mountainDifficulty: 'medium',
    groupSize: 2,
    hasGuide: false,
    hasMedicalCondition: false,
    durationDays: 2
  });
  const [result, setResult] = useState<SafetyResult | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(checkSafety(input));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
        <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        Safety Checker
      </h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-6 rounded-2xl md:col-span-full">
          <p className="text-stone-600 dark:text-stone-400 mb-6 text-sm">Sistem ini memvalidasi keamanan rencana pendakian Anda berdasarkan variabel kelompok, cuaca, dan tingkat kerumitan gunung.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">Pengalaman</label>
                <select value={input.experienceLevel} onChange={(e) => setInput({...input, experienceLevel: e.target.value as any})} className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl outline-none">
                  <option value="beginner">Pemula</option>
                  <option value="intermediate">Menengah</option>
                  <option value="advanced">Lanjutan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">Kondisi Fisik saat ini</label>
                <select value={input.physicalCondition} onChange={(e) => setInput({...input, physicalCondition: e.target.value as any})} className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl outline-none">
                  <option value="excellent">Sangat Fit</option>
                  <option value="good">Fit</option>
                  <option value="average">Biasa (Jarang olahraga)</option>
                  <option value="poor">Kurang Sehat</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">Kondisi Cuaca Prediksi</label>
                <select value={input.weatherCondition} onChange={(e) => setInput({...input, weatherCondition: e.target.value as any})} className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl outline-none">
                  <option value="clear">Cerah</option>
                  <option value="cloudy">Berawan/Kabut</option>
                  <option value="rainy">Hujan</option>
                  <option value="stormy">Badai/Angin Kencang</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">Tingkat Kesulitan Gunung</label>
                <select value={input.mountainDifficulty} onChange={(e) => setInput({...input, mountainDifficulty: e.target.value as any})} className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl outline-none">
                  <option value="easy">Pemula</option>
                  <option value="medium">Menengah</option>
                  <option value="hard">Sulit</option>
                  <option value="expert">Extrem</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">Punya Pemandu Lokal?</label>
                <select value={input.hasGuide ? 'yes' : 'no'} onChange={(e) => setInput({...input, hasGuide: e.target.value === 'yes'})} className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl outline-none">
                  <option value="no">Tidak</option>
                  <option value="yes">Ya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">Punya Kondisi Medis Khusus?</label>
                <select value={input.hasMedicalCondition ? 'yes' : 'no'} onChange={(e) => setInput({...input, hasMedicalCondition: e.target.value === 'yes'})} className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl outline-none text-red-600">
                  <option value="no">Tidak</option>
                  <option value="yes">Ya</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-3 px-4 mt-6 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white font-medium rounded-xl transition-colors">
              Analisis Keselamatan
            </button>
          </form>
        </div>

        {result && (
          <div className="col-span-full space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-700 pb-2">Laporan Analisis ({result.score}/100)</h2>
            
            <div className={`p-6 rounded-2xl border-2 flex items-center justify-between
              ${result.status === 'GO' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100' : 
                result.status === 'CAUTION' ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800 text-amber-900 dark:text-amber-100' :
                'bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800 text-red-900 dark:text-red-100'}`}>
              <div>
                <h3 className="text-3xl font-extrabold tracking-tight mb-1">STATUS: {result.status}</h3>
                <p className="text-sm font-medium opacity-80">
                  {result.status === 'GO' ? 'Semua indikator mendukung, persiapkan dengan baik.' :
                   result.status === 'CAUTION' ? 'Perhatian penuh dibutuhkan. Risiko di atas rata-rata.' :
                   'Kondisi SANGAT TIDAK DIREKOMENDASIKAN untuk mendaki.'}
                </p>
              </div>
              <div className="shrink-0 ml-4">
                {result.status === 'GO' ? <CheckCircle className="w-16 h-16 text-emerald-500" /> : result.status === 'CAUTION' ? <AlertTriangle className="w-16 h-16 text-amber-500" /> : <XCircle className="w-16 h-16 text-red-500" />}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {result.recommendations.length > 0 && (
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-5 rounded-2xl shadow-sm">
                  <h4 className="font-bold text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2"><CheckCircle className="w-5 h-5"/> Rekomendasi Pintar</h4>
                  <ul className="space-y-2">
                    {result.recommendations.map((r, i) => <li key={i} className="text-sm text-stone-600 dark:text-stone-400 pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-emerald-500 before:rounded-full">{r}</li>)}
                  </ul>
                </div>
              )}
              {result.warnings.length > 0 && (
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-5 rounded-2xl shadow-sm">
                  <h4 className="font-bold text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Peringatan Dini</h4>
                  <ul className="space-y-2">
                    {result.warnings.map((r, i) => <li key={i} className="text-sm text-stone-600 dark:text-stone-400 pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-amber-500 before:rounded-full">{r}</li>)}
                  </ul>
                </div>
              )}
              {result.improvements.length > 0 && (
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-5 rounded-2xl shadow-sm md:col-span-full">
                  <h4 className="font-bold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2"><XCircle className="w-5 h-5"/> Wajib Diperbaiki Sebelum Mendaki</h4>
                  <ul className="space-y-2">
                    {result.improvements.map((r, i) => <li key={i} className="text-sm text-stone-600 dark:text-stone-400 pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-red-500 before:rounded-full">{r}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
