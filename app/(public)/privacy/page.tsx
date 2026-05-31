import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export const metadata = {
    title: 'Kebijakan Privasi - Hike Wise',
    description: 'Kebijakan privasi aplikasi Hike Wise.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex-grow bg-stone-50 dark:bg-stone-950">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
                    </Link>

                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">Kebijakan Privasi</h1>
                    </div>

                    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 sm:p-10 shadow-sm space-y-8 text-stone-700 dark:text-stone-300 leading-relaxed">
                        <p className="text-sm text-stone-500 dark:text-stone-400">Terakhir diperbarui: 31 Mei 2026</p>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">1. Pendahuluan</h2>
                            <p>
                                Hike Wise (&quot;kami&quot;, &quot;milik kami&quot;) menghargai privasi Anda. Kebijakan
                                Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan
                                melindungi informasi pribadi Anda saat menggunakan layanan kami.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                                2. Informasi yang Kami Kumpulkan
                            </h2>
                            <p>Kami mengumpulkan informasi berikut saat Anda mendaftar dan menggunakan aplikasi:</p>
                            <ul className="list-disc list-inside space-y-1 pl-2">
                                <li>Nama lengkap dan alamat email</li>
                                <li>Data perjalanan pendakian (rencana trip, itinerary, packing list)</li>
                                <li>Data eco log (jumlah sampah yang dikumpulkan)</li>
                                <li>Laporan kondisi jalur yang Anda kirimkan</li>
                                <li>Data pencapaian (achievement) yang diperoleh</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                                3. Penggunaan Informasi
                            </h2>
                            <p>Informasi Anda digunakan untuk:</p>
                            <ul className="list-disc list-inside space-y-1 pl-2">
                                <li>Menyediakan dan meningkatkan layanan perencanaan pendakian</li>
                                <li>Menghitung dan menampilkan statistik eco score dan leaderboard</li>
                                <li>Memverifikasi laporan kondisi jalur komunitas</li>
                                <li>Mengirimkan notifikasi terkait perjalanan Anda</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                                4. Penyimpanan Data
                            </h2>
                            <p>
                                Data Anda disimpan secara aman menggunakan layanan Firebase (Google Cloud) dengan
                                enkripsi standar industri. Kami hanya menyimpan data selama diperlukan untuk menyediakan
                                layanan kepada Anda.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">5. Berbagi Data</h2>
                            <p>
                                Kami <strong>tidak</strong> menjual, memperdagangkan, atau menyewakan informasi pribadi
                                Anda kepada pihak ketiga. Data yang ditampilkan di leaderboard dan laporan komunitas
                                hanya berupa nama dan skor eco yang bersifat publik.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">6. Hak Pengguna</h2>
                            <p>Anda berhak untuk:</p>
                            <ul className="list-disc list-inside space-y-1 pl-2">
                                <li>Mengakses dan memperbarui informasi pribadi Anda</li>
                                <li>Meminta penghapusan akun dan seluruh data terkait</li>
                                <li>Menarik persetujuan penggunaan data kapan saja</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">7. Hubungi Kami</h2>
                            <p>
                                Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini, silakan hubungi kami
                                melalui email di{' '}
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                    rimbasmita@gmail.com
                                </span>
                                .
                            </p>
                        </section>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
