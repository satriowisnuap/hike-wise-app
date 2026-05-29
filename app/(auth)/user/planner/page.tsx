'use client';

import { useState } from 'react';
import { generateItinerary, PlannerInput } from '@/lib/trail-planner';
import { ItineraryDay } from '@/types';

export default function PlannerPage() {
  const [input, setInput] = useState<PlannerInput>({
    mountainName: '',
    mountainDifficulty: 'medium',
    duration: 2,
    members: 2,
    experienceLevel: 'intermediate'
  });
  const [result, setResult] = useState<ItineraryDay[] | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(generateItinerary(input));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Trail Planner 🗺️</h1>
      
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-6 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">Nama Gunung</label>
              <input
                type="text"
                required
                value={input.mountainName}
                onChange={(e) => setInput({ ...input, mountainName: e.target.value })}
                className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-stone-900 dark:text-stone-100"
                placeholder="Misal: Gunung Rinjani"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">Tingkat Kesulitan</label>
              <select
                value={input.mountainDifficulty}
                onChange={(e) => setInput({ ...input, mountainDifficulty: e.target.value as any })}
                className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-stone-900 dark:text-stone-100"
              >
                <option value="easy">Pemula (Mudah)</option>
                <option value="medium">Menengah</option>
                <option value="hard">Sulit</option>
                <option value="expert">Ahli/Sangat Sulit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">Durasi (Hari)</label>
              <input
                type="number"
                min="1"
                required
                value={input.duration}
                onChange={(e) => setInput({ ...input, duration: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">Jumlah Anggota</label>
              <input
                type="number"
                min="1"
                required
                value={input.members}
                onChange={(e) => setInput({ ...input, members: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-stone-900 dark:text-stone-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">Pengalaman Mayoritas Tim</label>
              <select
                value={input.experienceLevel}
                onChange={(e) => setInput({ ...input, experienceLevel: e.target.value as any })}
                className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-stone-900 dark:text-stone-100"
              >
                <option value="beginner">Pemula (Baru pertama/sedikit pengalaman)</option>
                <option value="intermediate">Menengah (Lebih dari 3 kali mendaki)</option>
                <option value="advanced">Lanjutan (Berpengalaman dengan medan teknis)</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white font-medium rounded-xl transition-colors">
            Buat Itinerary Sekarang
          </button>
        </form>
      </div>

      {result && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-700 pb-2">Hasil Itinerary</h2>
          {result.map((day, idx) => (
            <div key={idx} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-6 rounded-2xl shadow-sm">
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-4 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 inline-block px-3 py-1 rounded-lg">Hari {day.day}: {day.title}</h3>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-200 dark:before:via-stone-700 before:to-transparent">
                {day.activities.map((act, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-stone-900 bg-emerald-100 dark:bg-emerald-900 text-stone-900 dark:text-stone-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      {act.icon}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-stone-50 dark:bg-stone-800 p-4 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-stone-900 dark:text-stone-100">{act.activity}</h4>
                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{act.time}</span>
                      </div>
                      <p className="text-sm text-stone-600 dark:text-stone-400">{act.notes}</p>
                      <p className="text-xs text-stone-400 dark:text-stone-500 mt-2">⏱️ Durasi: {act.durationMinutes} menit</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
