'use client';

import { useState } from 'react';
import { generatePackingList, PackingInput } from '@/lib/packing-list';
import { PackingCategory } from '@/types';

export default function PackingListPage() {
  const [input, setInput] = useState<PackingInput>({
    duration: 2,
    tripType: 'overnight',
    season: 'dry',
    members: 2,
    difficulty: 'medium'
  });
  const [result, setResult] = useState<PackingCategory[] | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(generatePackingList(input));
  };

  const toggleCheck = (categoryIdx: number, itemIdx: number) => {
    if (!result) return;
    const newList = [...result];
    newList[categoryIdx].items[itemIdx].checked = !newList[categoryIdx].items[itemIdx].checked;
    setResult(newList);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Smart Packing List 🎒</h1>
      
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-6 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">Jenis Trip</label>
              <select
                value={input.tripType}
                onChange={(e) => setInput({ ...input, tripType: e.target.value as any })}
                className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-stone-900 dark:text-stone-100"
              >
                <option value="day-hike">Day Hike (Pulang Hari)</option>
                <option value="overnight">Camping (Menginap)</option>
                <option value="expedition">Ekspedisi (&gt;3 Hari)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">Musim</label>
              <select
                value={input.season}
                onChange={(e) => setInput({ ...input, season: e.target.value as any })}
                className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-stone-900 dark:text-stone-100"
              >
                <option value="dry">Kemarau (Kering)</option>
                <option value="wet">Hujan (Basah)</option>
              </select>
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
              <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">Tingkat Kesulitan Medan</label>
              <select
                value={input.difficulty}
                onChange={(e) => setInput({ ...input, difficulty: e.target.value as any })}
                className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-stone-900 dark:text-stone-100"
              >
                <option value="easy">Pemula (Mudah)</option>
                <option value="medium">Menengah</option>
                <option value="hard">Sulit</option>
                <option value="expert">Ahli/Sangat Sulit</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white font-medium rounded-xl transition-colors">
            Generate Packing List
          </button>
        </form>
      </div>

      {result && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-700 pb-2">Daftar Bawaan</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {result.map((cat, cIdx) => (
              <div key={cIdx} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-5 rounded-2xl shadow-sm space-y-3">
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-lg flex items-center gap-2">
                  <span>{cat.icon}</span> {cat.category}
                </h3>
                <ul className="space-y-2">
                  {cat.items.map((item, iIdx) => (
                    <li key={item.id} className="flex items-start gap-3 p-2 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg cursor-pointer transition-colors" onClick={() => toggleCheck(cIdx, iIdx)}>
                      <div className={`mt-0.5 w-5 h-5 flex items-center justify-center rounded border flex-shrink-0 transition-colors ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'bg-transparent border-stone-300 dark:border-stone-600'}`}>
                        {item.checked && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${item.checked ? 'text-stone-400 line-through' : 'text-stone-900 dark:text-stone-100'} transition-all`}>
                          {item.name} <span className="font-medium text-emerald-600 dark:text-emerald-400">({item.quantity} {item.unit})</span>
                        </p>
                        {item.isEssential && (
                          <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded">Wajib</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
