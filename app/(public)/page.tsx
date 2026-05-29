'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import ThemeToggle from '@/components/ThemeToggle';
import { Map, Briefcase, ShieldCheck, Leaf, MessageSquare, Award } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({ hikers: 0, mountains: 0, trash: 0 });

  useEffect(() => {
    // Simulated stat count up for visual effect
    const finalStats = { hikers: 1240, mountains: 87, trash: 2400 };
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      setStats({
        hikers: Math.min(Math.floor((finalStats.hikers / 20) * frame), finalStats.hikers),
        mountains: Math.min(Math.floor((finalStats.mountains / 20) * frame), finalStats.mountains),
        trash: Math.min(Math.floor((finalStats.trash / 20) * frame), finalStats.trash),
      });
      if (frame >= 20) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-stone-900/80 border-b border-stone-200 dark:border-stone-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏔️</span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Hike Wise</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#fitur" className="text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100">Fitur</a>
              <a href="#cara-kerja" className="text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100">Cara Kerja</a>
              <a href="#komunitas" className="text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100">Komunitas</a>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link 
                href={currentUser ? '/user/dashboard' : '/login'} 
                className="hidden sm:inline-flex px-4 py-2 text-sm font-medium rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950 dark:hover:bg-emerald-900 transition-colors"
              >
                {currentUser ? 'Dashboard' : 'Masuk'}
              </Link>
              {!currentUser && (
                <Link 
                  href="/register" 
                  className="px-4 py-2 text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 transition-colors shadow-sm"
                >
                  Daftar Gratis
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-stone-900 to-stone-950 py-24 sm:py-32">
          <div className="absolute inset-0 bg-[url('https://picsum.photos/id/1018/1920/1080')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
              Jelajahi Alam,<br className="hidden sm:block"/> <span className="text-emerald-400">Jaga Bumi Bersama</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-stone-300 mb-10 text-balance">
              Hike Wise adalah pendamping pendakian cerdasmu. Rencanakan perjalanan dengan aman, siapkan barang bawaan, dan lacak dampak positifmu untuk lingkungan.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register" className="px-8 py-4 text-base font-bold rounded-xl text-stone-900 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-lg">
                Mulai Rencanakan &rarr;
              </Link>
              <a href="#fitur" className="px-8 py-4 text-base font-bold rounded-xl text-white bg-stone-800/50 hover:bg-stone-800/80 backdrop-blur-sm border border-stone-700 transition-colors">
                Lihat Fitur
              </a>
            </div>
            
            <div className="mt-16 grid grid-cols-3 gap-4 border-t border-stone-800/50 pt-8 max-w-3xl mx-auto">
              <div>
                <p className="text-3xl font-bold text-white">{stats.hikers}+</p>
                <p className="text-sm font-medium text-stone-400 uppercase tracking-wide">Pendaki</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.mountains}</p>
                <p className="text-sm font-medium text-stone-400 uppercase tracking-wide">Gunung</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-400">{stats.trash.toLocaleString('id-ID')} <span className="text-xl">kg</span></p>
                <p className="text-sm font-medium text-emerald-600 uppercase tracking-wide">Sampah Turun</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="fitur" className="py-24 bg-stone-50 dark:bg-stone-950 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100">Fitur Utama</h2>
              <p className="mt-4 text-lg text-stone-600 dark:text-stone-400">Semua yang kamu butuhkan untuk pendakian yang aman dan bertanggung jawab.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Map, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/40', title: 'Trail Planner', desc: 'Buat rencana perjalanan otomatis sesuai tingkat pengalaman dan kesulitan gunung.' },
                { icon: Briefcase, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/40', title: 'Packing List', desc: 'Daftar bawaan disesuaikan dengan durasi, cuaca, dan jumlah anggota kelompok.' },
                { icon: ShieldCheck, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/40', title: 'Safety Checker', desc: 'Algoritma mitigasi risiko pendakian berdasarkan kondisi personal dan cuaca.' },
                { icon: Leaf, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/40', title: 'Eco Tracker', desc: 'Catat dan laporkan jumlah sampah yang dibawa turun, jadilah pahlawan lingkungan.' },
                { icon: MessageSquare, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/40', title: 'Laporan Jalur', desc: 'Informasi kondisi jalur dan cuaca terkini dari komunitas untuk keamanan bersama.' },
                { icon: Award, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/40', title: 'Achievement', desc: 'Selesaikan misi, tingkatkan Eco Score, dan koleksi badge menarik.' }
              ].map((ft, idx) => (
                <div key={idx} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className={`w-12 h-12 rounded-xl ${ft.bg} ${ft.color} flex items-center justify-center mb-6`}>
                    <ft.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">{ft.title}</h3>
                  <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">{ft.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="cara-kerja" className="py-24 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-16">Cara Kerja</h2>
            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connector line on desktop */}
              <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-0.5 bg-stone-200 dark:bg-stone-700 -z-10"></div>
              
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 font-bold text-2xl flex items-center justify-center mb-6 shadow-sm border-4 border-white dark:border-stone-900">1</div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">Buat Akun</h3>
                <p className="text-stone-600 dark:text-stone-400">Proses kurang dari 10 detik. Gratis sepenuhnya.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 font-bold text-2xl flex items-center justify-center mb-6 shadow-sm border-4 border-white dark:border-stone-900">2</div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">Rencanakan Pendakian</h3>
                <p className="text-stone-600 dark:text-stone-400">Pilih gunung, cek safety, dan siapkan packing list.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 font-bold text-2xl flex items-center justify-center mb-6 shadow-sm border-4 border-white dark:border-stone-900">3</div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">Jaga & Bagikan</h3>
                <p className="text-stone-600 dark:text-stone-400">Catat bawaan turun sampahmu dan bagikan info jalur ke komunitas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-emerald-900 text-white py-20 px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Siap Mendaki Lebih Cerdas?</h2>
          <p className="text-emerald-100 mb-10 max-w-xl mx-auto">Gabung bersama ribuan pendaki Indonesia lainnya yang peduli pada keselamatan diri dan kelestarian alam.</p>
          <Link href="/register" className="inline-block px-8 py-4 text-lg font-bold rounded-xl text-stone-900 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-lg">
            Daftar Sekarang
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="text-xl">🏔️</span>
            <span className="text-lg font-bold text-stone-900 dark:text-stone-100">Hike Wise</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-stone-500 dark:text-stone-400">
            <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Kebijakan Privasi</a>
            <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Syarat & Ketentuan</a>
            <span>&copy; 2026 Hike Wise</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
