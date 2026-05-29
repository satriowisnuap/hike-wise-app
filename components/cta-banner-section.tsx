import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CtaBanner() {
    return (
        <section className="bg-emerald-900 text-white py-20 px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Siap Mendaki Lebih Cerdas?</h2>
            <p className="text-emerald-100 mb-10 max-w-xl mx-auto">
                Gabung bersama ribuan pendaki Indonesia lainnya yang peduli pada keselamatan diri dan kelestarian alam.
            </p>
            <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 text-lg font-bold rounded-xl text-stone-900 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-lg"
            >
                Daftar Sekarang <ArrowRight className="w-5 h-5" />
            </Link>
        </section>
    );
}
