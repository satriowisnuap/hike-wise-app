const steps = [
    { step: '1', title: 'Buat Akun', desc: 'Proses kurang dari 10 detik. Gratis sepenuhnya.' },
    { step: '2', title: 'Rencanakan Pendakian', desc: 'Pilih gunung, cek safety, dan siapkan packing list.' },
    { step: '3', title: 'Jaga & Bagikan', desc: 'Catat bawaan turun sampahmu dan bagikan info jalur ke komunitas.' },
];

export default function HowItWorksSection() {
    return (
        <section
            id="cara-kerja"
            className="py-24 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 transition-colors"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-16">Cara Kerja</h2>
                <div className="grid md:grid-cols-3 gap-12 relative">
                    <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-0.5 bg-stone-200 dark:bg-stone-700 -z-10" />
                    {steps.map(({ step, title, desc }) => (
                        <div key={step} className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 font-bold text-2xl flex items-center justify-center mb-6 shadow-sm border-4 border-white dark:border-stone-900">
                                {step}
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">{title}</h3>
                            <p className="text-stone-600 dark:text-stone-400">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
