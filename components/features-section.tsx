import { Map, Briefcase, ShieldCheck, Leaf, MessageSquare, Award } from 'lucide-react';

const features = [
    {
        icon: Map,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-100 dark:bg-blue-900/40',
        title: 'Trail Planner',
        desc: 'Buat rencana perjalanan otomatis sesuai tingkat pengalaman dan kesulitan gunung.',
    },
    {
        icon: Briefcase,
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-100 dark:bg-amber-900/40',
        title: 'Packing List',
        desc: 'Daftar bawaan disesuaikan dengan durasi, cuaca, dan jumlah anggota kelompok.',
    },
    {
        icon: ShieldCheck,
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-100 dark:bg-red-900/40',
        title: 'Safety Checker',
        desc: 'Algoritma mitigasi risiko pendakian berdasarkan kondisi personal dan cuaca.',
    },
    {
        icon: Leaf,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-100 dark:bg-emerald-900/40',
        title: 'Eco Tracker',
        desc: 'Catat dan laporkan jumlah sampah yang dibawa turun, jadilah pahlawan lingkungan.',
    },
    {
        icon: MessageSquare,
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-100 dark:bg-indigo-900/40',
        title: 'Laporan Jalur',
        desc: 'Informasi kondisi jalur dan cuaca terkini dari komunitas untuk keamanan bersama.',
    },
    {
        icon: Award,
        color: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-100 dark:bg-orange-900/40',
        title: 'Achievement',
        desc: 'Selesaikan misi, tingkatkan Eco Score, dan koleksi badge menarik.',
    },
];

export default function FeaturesSection() {
    return (
        <section id="fitur" className="py-24 bg-stone-50 dark:bg-stone-950 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100">Fitur Utama</h2>
                    <p className="mt-4 text-lg text-stone-600 dark:text-stone-400">
                        Semua yang kamu butuhkan untuk pendakian yang aman dan bertanggung jawab.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((ft, idx) => (
                        <div
                            key={idx}
                            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
                        >
                            <div
                                className={`w-12 h-12 rounded-xl ${ft.bg} ${ft.color} flex items-center justify-center mb-6`}
                            >
                                <ft.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">{ft.title}</h3>
                            <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">{ft.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
