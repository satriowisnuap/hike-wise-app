'use client';

import Link from 'next/link';
import { Compass, ArrowLeft, Home, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 p-6 relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-stone-500/10 dark:bg-stone-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-md w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl dark:shadow-stone-950/50 p-8 text-center relative z-10 transition-all duration-300">
        
        {/* Animated Icon Container */}
        <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-900/30">
          <Compass className="w-12 h-12 animate-[spin_20s_linear_infinite]" />
        </div>

        {/* 404 Text */}
        <h1 className="text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 mb-2 select-none">
          404
        </h1>

        {/* Title */}
        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3">
          Jalur Tidak Ditemukan
        </h2>

        {/* Description */}
        <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed mb-8">
          Sepertinya Anda keluar dari peta pendakian atau melangkah ke rute yang belum dipetakan. Halaman yang Anda cari tidak tersedia.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all duration-200 active:scale-[0.98] shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20"
          >
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-transparent hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium rounded-xl border border-stone-200 dark:border-stone-800 transition-all duration-200 active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Halaman Sebelumnya
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-center gap-1.5 text-xs text-stone-400 dark:text-stone-500">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Butuh bantuan? Silakan hubungi administrator Hike Wise.</span>
        </div>
      </div>
    </div>
  );
}
