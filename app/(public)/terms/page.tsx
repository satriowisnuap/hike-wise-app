import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/footer';

export const metadata = {
    title: 'Syarat & Ketentuan - Hike Wise',
    description: 'Syarat dan ketentuan penggunaan aplikasi Hike Wise.',
};

export default function TermsPage() {
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
                        <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
                            Syarat &amp; Ketentuan
                        </h1>
                    </div>

                    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 sm:p-10 shadow-sm space-y-8 text-stone-700 dark:text-stone-300 leading-relaxed">
                        <p className="text-sm text-stone-500 dark:text-stone-400">Terakhir diperbarui: 31 Mei 2026</p>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                                1. Penerimaan Syarat
                            </h2>
                            <p>
                                Dengan mengakses dan menggunakan aplikasi Hike Wise, Anda menyetujui untuk terikat
                                dengan syarat dan ketentuan berikut. Jika Anda tidak setuju dengan salah satu ketentuan
                                ini, mohon untuk tidak menggunakan layanan kami.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                                2. Deskripsi Layanan
                            </h2>
                            <p>
                                Hike Wise adalah platform digital yang membantu pendaki dalam merencanakan perjalanan
                                pendakian, mempersiapkan perlengkapan, memantau keselamatan, serta melacak dampak
                                positif terhadap lingkungan melalui fitur eco tracker.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">3. Akun Pengguna</h2>
                            <ul className="list-disc list-inside space-y-1 pl-2">
                                <li>Anda bertanggung jawab menjaga kerahasiaan akun dan kata sandi Anda.</li>
                                <li>Informasi yang diberikan saat pendaftaran harus akurat dan terkini.</li>
                                <li>Satu orang hanya diperbolehkan memiliki satu akun aktif.</li>
                                <li>Kami berhak menangguhkan akun yang melanggar ketentuan ini.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                                4. Penggunaan yang Diperbolehkan
                            </h2>
                            <p>Anda setuju untuk tidak:</p>
                            <ul className="list-disc list-inside space-y-1 pl-2">
                                <li>Mengirimkan laporan kondisi jalur yang palsu atau menyesatkan</li>
                                <li>Memanipulasi data eco score atau pencapaian</li>
                                <li>Menggunakan layanan untuk tujuan ilegal atau merugikan pihak lain</li>
                                <li>Mengakses sistem secara tidak sah atau mengganggu infrastruktur kami</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                                5. Laporan Komunitas
                            </h2>
                            <p>
                                Semua laporan kondisi jalur yang dikirimkan oleh pengguna akan melalui proses moderasi
                                oleh admin sebelum dipublikasikan. Kami berhak menolak atau menghapus laporan yang
                                dianggap tidak sesuai, tidak akurat, atau melanggar pedoman komunitas.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                                6. Batasan Tanggung Jawab
                            </h2>
                            <p>
                                Hike Wise menyediakan informasi dan rekomendasi sebagai panduan umum. Kami{' '}
                                <strong>tidak bertanggung jawab</strong> atas:
                            </p>
                            <ul className="list-disc list-inside space-y-1 pl-2">
                                <li>Kecelakaan atau insiden yang terjadi selama pendakian</li>
                                <li>Ketidakakuratan laporan kondisi jalur dari pengguna lain</li>
                                <li>Kerugian yang timbul akibat penggunaan rekomendasi dari aplikasi</li>
                            </ul>
                            <p>
                                Keputusan akhir untuk melakukan pendakian sepenuhnya menjadi tanggung jawab pengguna.
                                Selalu lakukan riset mandiri dan persiapan yang memadai.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                                7. Perubahan Ketentuan
                            </h2>
                            <p>
                                Kami berhak memperbarui syarat dan ketentuan ini sewaktu-waktu. Perubahan akan berlaku
                                efektif segera setelah dipublikasikan di halaman ini. Penggunaan layanan secara
                                berkelanjutan setelah perubahan berarti Anda menyetujui ketentuan yang diperbarui.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">8. Hubungi Kami</h2>
                            <p>
                                Jika Anda memiliki pertanyaan mengenai syarat dan ketentuan ini, silakan hubungi kami
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
