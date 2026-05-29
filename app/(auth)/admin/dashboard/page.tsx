'use client';

import { BarChart, Mountain, Users, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Ikhtisar SistemAdmin</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <Mountain className="w-8 h-8 text-emerald-500 mb-2" />
          <p className="text-3xl font-bold text-stone-900 dark:text-stone-100">87</p>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Gunung Aktif</p>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <Users className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-3xl font-bold text-stone-900 dark:text-stone-100">1,240</p>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Total Pengguna</p>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <BarChart className="w-8 h-8 text-amber-500 mb-2" />
          <p className="text-3xl font-bold text-stone-900 dark:text-stone-100">5.2k</p>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Total Trip</p>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
          <p className="text-3xl font-bold text-stone-900 dark:text-stone-100 relative z-10">12</p>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 relative z-10">Laporan Pending</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-6 rounded-2xl">
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-4">Aksi Cepat Admin</h2>
          <div className="space-y-3">
            <Link href="/admin/mountains" className="flex items-center justify-between p-4 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
              <span className="font-medium text-stone-900 dark:text-stone-100">Tambah Data Gunung</span>
              <Mountain className="w-5 h-5 text-stone-400" />
            </Link>
            <Link href="/admin/reports" className="flex items-center justify-between p-4 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
              <span className="font-medium text-stone-900 dark:text-stone-100">Moderasi Laporan Jalur</span>
              <AlertTriangle className="w-5 h-5 text-stone-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
